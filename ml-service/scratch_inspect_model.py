import tensorflow as tf
import os

model_path = os.path.join('models', 'skin_cancer_model.h5')
if os.path.exists(model_path):
    model = tf.keras.models.load_model(model_path, compile=False)
    with open('model_summary.txt', 'w') as f:
        model.summary(print_fn=lambda x: f.write(x + '\n'))
    print("Summary saved to model_summary.txt")
else:
    print(f"Model not found at {model_path}")
