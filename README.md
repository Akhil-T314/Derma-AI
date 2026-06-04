# DermAI

DermAI is an intelligent dermatology triage and assistive skin lesion scanning platform. It combines a React-based frontend, a Node.js Express backend, and a FastAPI-based machine learning service to deliver automatic image preprocessing, hybrid neural network inference, and explainable AI insights for skin lesions.

---

## 🛠️ Project Architecture

The application is structured as a multi-service monorepo:

```
├── backend/            # Express.js backend (handles users, database, uploads)
├── ml-service/         # FastAPI python server (image preprocessing, model inference, XAI)
├── src/                # React (Vite) frontend application
├── package.json        # Root package definition (concurrent workspace scripts)
└── README.md           # Project documentation
```

### Technical Stack
* **Frontend**: React (Vite), Tailwind CSS (v4), Framer Motion, Recharts, Lucide Icons, React Router DOM.
* **Backend**: Node.js, Express, PostgreSQL / Supabase, Multer (file uploads).
* **ML Service**: Python, FastAPI, TensorFlow/Keras, OpenCV, NumPy, XGBoost.

---

## 🧠 Machine Learning & XAI Pipeline

DermAI utilizes an advanced multi-stage processing pipeline on every scan:

1. **Input Validation**: OpenCV-based Haar Cascades face detector automatically rejects portrait/face photos to keep input clean.
2. **Medical Preprocessing**:
   * **Hair Removal**: Morphological Blackhat filtering followed by Telea inpainting to eliminate artifacts.
   * **Noise Reduction**: 3x3 Median Blur filtering.
   * **Contrast Normalization**: Contrast Limited Adaptive Histogram Equalization (CLAHE) on the L-channel in LAB space.
   * **Texture Enhancement**: Sakaguchi-type non-linear contrast enhancement highlighting fine lesion textures.
3. **Hybrid Neural Network Inference**:
   * Features are extracted using a pre-trained CNN backbone and merged with a hybrid model (comprising CNN, BiLSTM, ViT, and CapsNet components).
   * Incorporates real-time clinical heuristics (e.g. standard deviation color-variance checks for melanoma risk boost).
4. **Explainable AI (XAI)**:
   * **Grad-CAM**: Visualizes activation patterns at the last convolutional layer.
   * **Integrated Gradients**: Attribute pixel attribution mapping (visualized using the `TWILIGHT_SHIFTED` colormap) to showcase precise fine-grained features.
5. **Progression Risk Prediction**:
   * Evaluates diagnostic confidence and malignancy traits using a simulated XGBoost risk calculator to forecast future progression risk.

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **Python** (v3.10 or higher recommended)
* **PostgreSQL / Supabase Database instance**

---

### Step 1: Database Setup & Backend Environment

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `DATABASE_URL` in `.env` with your Supabase/PostgreSQL connection string.

---

### Step 2: Machine Learning Service Setup

1. Navigate to the `ml-service/` directory:
   ```bash
   cd ml-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. **Pre-trained Weights**:
   Ensure you place your pre-trained `skin_cancer_model.h5` inside the `ml-service/models/` folder. If absent, the system will initialize a dummy model with initialized weights.

---

### Step 3: Run the Application

From the **root directory**, you can start all services concurrently:

```bash
npm install
npm run dev
```

This launches:
* **Frontend**: [http://localhost:5173](http://localhost:5173) (Vite dev server)
* **Backend**: [http://localhost:3000](http://localhost:3000) (Express server)
* **ML Service**: [http://localhost:8000](http://localhost:8000) (FastAPI uvicorn server)

---

## 📈 Individual Run Commands

If you want to run services separately:
* Run Frontend: `npm run dev:frontend`
* Run Backend: `npm run dev:backend`
* Run ML Service: `npm run dev:ml`
