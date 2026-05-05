import os
import cv2
import uuid
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class ImageRequest(BaseModel):
    image_path: str

# Class names will be updated with the new model
class_names = [
    "Class_0",
    "Class_1",
    "Class_2",
    "Class_3",
    "Class_4",
    "Class_5",
    "Class_6"
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'skin_cancer_model.h5')

if not os.path.exists(MODEL_PATH):
    print(f'Warning: Model not found at {MODEL_PATH}. Waiting for new model to be added.')
    model = None
else:
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print('Model loaded successfully.')
    except Exception as e:
        print(f'Failed to load model: {e}')
        model = None

def preprocess_image(image_path: str):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f'Image not found at path: {image_path}')

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image not loaded properly. Check file path.")

    # Base reshaping for incoming model 
    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype(np.float32)

    # Any custom normalization based on new model requirements goes here
    # e.g., img = img / 255.0 OR preprocess_input(img)
    
    img = np.expand_dims(img, axis=0)
    return img

def generate_lrp_heatmap(img_array, original_image_path):
    # Simulated Layer-wise Relevance Propagation via Input Saliency (Vanilla Gradients)
    try:
        base_model = model.layers[0] if isinstance(model.layers[0], tf.keras.Model) else model
        dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
        base_model.predict(dummy)

        img_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)
        with tf.GradientTape() as tape:
            tape.watch(img_tensor)
            predictions = base_model(img_tensor)
            class_idx = tf.argmax(predictions[0])
            loss = predictions[:, class_idx]

        grads = tape.gradient(loss, img_tensor)
        saliency = tf.reduce_max(tf.abs(grads), axis=-1)[0]

        saliency = saliency.numpy()
        saliency = np.maximum(saliency, 0)
        if np.max(saliency) != 0:
            saliency /= np.max(saliency)

        original_img = cv2.imread(original_image_path)
        lrp_resized = cv2.resize(saliency, (original_img.shape[1], original_img.shape[0]))
        
        lrp_colored = np.uint8(255 * lrp_resized)
        lrp_colored = cv2.applyColorMap(lrp_colored, cv2.COLORMAP_HOT)
        superimposed_lrp = cv2.addWeighted(original_img, 0.5, lrp_colored, 0.5, 0)

        upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'uploads'))
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"lrp_{uuid.uuid4().hex}.jpg"
        save_path = os.path.join(upload_dir, filename)
        lrp_path = f"uploads/{filename}"
        cv2.imwrite(save_path, superimposed_lrp)

        return lrp_path
        
    except Exception as e:
        print(f"[DEBUG] LRP failed: {e}")
        return None

@app.post('/predict')
async def predict_lesion(request: ImageRequest):
    if model is None:
        raise HTTPException(status_code=500, detail='Model not found or failed to load. Please add the new model.')

    try:
        img_pre = preprocess_image(request.image_path)
        
        preds = model.predict(img_pre)[0]
        top_indices = preds.argsort()[-2:][::-1]

        primary_class = class_names[top_indices[0]]
        secondary_class = class_names[top_indices[1]]

        primary_confidence = float(preds[top_indices[0]])
        secondary_confidence = float(preds[top_indices[1]])

        # Default confidence fallback logic can be updated later
        final_prediction = primary_class if primary_confidence >= 0.6 else "Uncertain"

        return {
            "final_prediction": final_prediction,
            "primary_prediction": primary_class,
            "primary_confidence": primary_confidence,
            "secondary_prediction": secondary_class,
            "secondary_confidence": secondary_confidence
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
