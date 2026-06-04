# 🔬 DermAI: Intelligent Dermatology Triage & Scan Platform

DermAI is a comprehensive, production-ready healthcare web application designed to assist clinical triage by analyzing dermatological skin lesions. Combining advanced **computer vision (CV)**, **deep learning (DL)**, and **explainable AI (XAI)**, the platform enables patients to perform initial scans, and empowers clinicians with robust diagnostics and progression forecasting.

---

## 🚀 Technologies & Tools Used

### Frontend & UI
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Core Backend & Database
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

### Machine Learning & Explainable AI
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![OpenCV](https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-black?style=for-the-badge)

---

## 🏗️ System Architecture

The following Mermaid diagram visualizes the interactive flow between the user, the database, and the AI models:

```mermaid
graph TD
    User([Patient / Doctor]) -->|Uploads Image & Requests Scan| FE[React Vite Frontend]
    FE -->|API Request| BE[Express Backend Server]
    BE -->|Checks/Logs Activity| DB[(PostgreSQL / Supabase)]
    BE -->|Forwards image| ML[FastAPI ML Service]
    
    subgraph ML-Service [FastAPI AI Engine]
        ML -->|1. Haar Cascade Classifier| Verify{Is it a Face?}
        Verify -->|Yes| Reject[Reject Image / Face Detected]
        Verify -->|No| Pre[2. OpenCV Medical Preprocessing]
        Pre -->|Morphological Blackhat + Inpainting| Hair[Hair Removal]
        Hair -->|CLAHE & Sakaguchi Function| Enh[Contrast & Texture Enhancement]
        Enh -->|3. CNN + Hybrid Ensemble| Model[Inference System]
        Model -->|4. Grad-CAM & Saliency Maps| XAI[Explainable AI Engine]
        Model -->|5. Progression Risk Model| XGB[XGBoost Forecasting]
    end
    
    XAI -->|Visual Heatmaps| BE
    XGB -->|Risk Score| BE
    BE -->|Return Processed Report| FE
```

---

## ✨ Key Features

* **🛡️ Smart Input Face Gatekeeping**: Automatically rejects facial portraits using Haar Cascade detectors to ensure only dermatological images are analyzed.
* **💇 Advanced Morphological Preprocessing**: Incorporates automated hair removal using blackhat transformations and mathematical inpainting (Telea algorithm).
* **🔬 Non-Linear Image Enhancement**: Applies Sakaguchi-type contrast amplification to highlight critical tissue textures and border variations.
* **🧠 Hybrid Neural Classification**: Employs a robust ensemble combining a deep CNN backbone with features tuned for HAM10000 dataset classifications.
* **👁️ Explainable AI (XAI)**:
  * **Grad-CAM**: Visualizes core model focus regions at the last convolutional layer.
  * **Integrated Gradients / LRP**: Highlights pixel-level attributions mapping the precise features driving predictions.
* **📈 Disease Progression Forecasting**: Predicts potential disease escalation paths using a custom progression risk model.

---

## 📡 REST API Reference

### 1. Express Backend Gateway (`PORT 3000`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (Patient, Doctor, Admin) | No |
| `POST` | `/api/auth/login` | Login user and issue session token | No |
| `GET` | `/api/scans` | Retrieve all diagnostic scans for a user | Yes |
| `POST` | `/api/scans/upload` | Upload lesion image, trigger ML, and save report | Yes |
| `GET` | `/api/scans/:id` | Fetch details of a specific scan | Yes |

### 2. FastAPI ML Engine (`PORT 8000`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/predict` | `{ "image_path": "string" }` | Performs face validation, hair removal, Sakaguchi enhancement, model prediction, and outputs Grad-CAM/LRP heatmaps. |

---

## ⚙️ Local Setup Guide

### 📋 Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)
* **Supabase** / PostgreSQL connection URL

### 1. Configure the Backend Database
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your variables:
   ```bash
   DATABASE_URL=postgresql://your_user:your_password@your_db_host:5432/postgres
   PORT=3000
   ```

### 2. Configure the ML Service
1. Navigate to the machine learning directory:
   ```bash
   cd ml-service
   ```
2. Create and start a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install package requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. **Note on weights**: Download and place your model file (`skin_cancer_model.h5`) inside `ml-service/models/`.

### 3. Launching the Platform
Start all components concurrently from the project's root folder:
```bash
npm install
npm run dev
```

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more details.
