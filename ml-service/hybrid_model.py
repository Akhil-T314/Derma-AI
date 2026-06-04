import tensorflow as tf
from tensorflow.keras import layers, models

class CapsuleLayer(layers.Layer):
    """
    Capsule Network layer for preserving spatial relationships.
    """
    def __init__(self, num_capsules, capsule_dim, routings=3, **kwargs):
        super(CapsuleLayer, self).__init__(**kwargs)
        self.num_capsules = num_capsules
        self.capsule_dim = capsule_dim
        self.routings = routings

    def build(self, input_shape):
        self.kernel = self.add_weight(shape=(input_shape[-1], self.num_capsules * self.capsule_dim),
                                      initializer='glorot_uniform',
                                      name='capsule_kernel')

    def call(self, inputs):
        # Dot product
        hat_inputs = tf.matmul(inputs, self.kernel)
        # Reshape for routing
        hat_inputs = tf.reshape(hat_inputs, [-1, self.num_capsules, self.capsule_dim])
        # Squashing activation
        squared_norm = tf.reduce_sum(tf.square(hat_inputs), axis=-1, keepdims=True)
        return squared_norm / (1 + squared_norm) * hat_inputs / tf.sqrt(squared_norm + tf.keras.backend.epsilon())

def build_hybrid_model(input_shape=(224, 224, 3), num_classes=7):
    """
    Constructs the Hybrid Framework: CNN + BiLSTM + ViT + Capsule
    """
    inputs = layers.Input(shape=input_shape)

    # 1. CNN Backbone (Spatial Feature Extraction)
    x = layers.Conv2D(32, (3, 3), activation='relu')(inputs)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(64, (3, 3), activation='relu')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(128, (3, 3), activation='relu')(x)
    
    # 2. Vision Transformer (ViT) Block (Global Contextual Features)
    # Patch projection (flattening spatial dimensions into tokens)
    shape = x.shape
    x_reshaped = layers.Reshape((shape[1]*shape[2], shape[3]))(x)
    # Multi-Head Attention
    attention_output = layers.MultiHeadAttention(num_heads=4, key_dim=shape[3])(x_reshaped, x_reshaped)
    x_vit = layers.Add()([x_reshaped, attention_output])
    x_vit = layers.LayerNormalization()(x_vit)

    # 3. BiLSTM (Sequential Learning)
    x_bilstm = layers.Bidirectional(layers.LSTM(64, return_sequences=True))(x_vit)
    x_bilstm = layers.GlobalAveragePooling1D()(x_bilstm)

    # 4. Capsule Network (Preserving Spatial Relationships)
    x_capsule = CapsuleLayer(num_capsules=10, capsule_dim=16)(x_bilstm)
    x_final = layers.Flatten()(x_capsule)

    # Output Layer
    outputs = layers.Dense(num_classes, activation='softmax')(x_final)

    return models.Model(inputs=inputs, outputs=outputs, name="Hybrid_Derma_Framework")

if __name__ == "__main__":
    model = build_hybrid_model()
    model.summary()
