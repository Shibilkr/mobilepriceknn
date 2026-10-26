# 📱 Mobile Price Classification · KNN (Python ML)

A Machine Learning project using **K-Nearest Neighbors (KNN)** implemented in **Python** to predict mobile phone price tiers based on hardware specifications.

---

## 🚀 Features

- **Core ML Model in Python (`knn_model.py`)**:
  - Implemented using **Scikit-Learn (`KNeighborsClassifier`)** with a clean pure-Python fallback.
  - **Min-Max Feature Normalization** to balance high-magnitude features (e.g. RAM 4096 MB) against lower-magnitude ones (e.g. Clock Speed 2.5 GHz).
  - **Euclidean Distance Metric** with $k = 5$ neighbors for optimal bias-variance tradeoff.
  - **Stratified 5-Fold Cross Validation** achieving **~93.5% – 95.0% accuracy**.
  - Comprehensive **Classification Report** (Precision, Recall, F1-Score) and Confusion Matrix.
  - Automatic CSV dataset export (`mobile_prices.csv`).

- **Python Web Backend (`app.py`)**:
  - Built with **FastAPI** & **Uvicorn**.
  - `POST /predict`: Real-time KNN prediction API.
  - `GET /api/model-info`: Detailed dataset breakdown and evaluation metrics.
  - Serves the modern, responsive web interface.

- **Interactive Web Interface (`index.html`, `style.css`, `app.js`)**:
  - Sliders for 14 hardware features (RAM, Battery, Camera, Screen Resolution, Cores, etc.).
  - Real-time classification badge, confidence meter, neighbor vote distribution breakdown, and matching phone models.

---

## 📁 Project Structure

```text
mlproject/
├── knn_model.py       # Core KNN model, dataset generation, training & evaluation
├── app.py             # Python FastAPI server serving UI and /predict API
├── mobile_prices.csv  # 120 phone dataset samples (14 features + price_range)
├── index.html         # Frontend web UI
├── style.css          # Modern dark styling
├── app.js             # Client-side logic calling Python /predict endpoint
├── requirements.txt   # Python dependencies
└── README.md          # Documentation
```

---

## 🛠️ Setup & Running

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```
*(Dependencies: `scikit-learn`, `numpy`, `pandas`, `fastapi`, `uvicorn`)*

### 2. Run the KNN Model Standalone (CLI & Evaluation)
To train the model, evaluate cross-validation accuracy, and test predictions directly in Python:
```bash
python3 knn_model.py
```

### 3. Run the Web Application
To start the Python web server:
```bash
python3 app.py
```
Then open your browser and navigate to:
👉 **`http://127.0.0.1:8000`**

---

## 📊 Dataset & Model Specifications

| Parameter | Value |
|---|---|
| **Algorithm** | K-Nearest Neighbors (KNN) |
| **Number of Neighbors ($k$)** | 5 |
| **Distance Metric** | Euclidean ($d(p, q) = \sqrt{\sum (p_i - q_i)^2}$) |
| **Feature Scaling** | Min-Max Normalization ($x_{norm} = \frac{x - x_{min}}{x_{max} - x_{min}}$) |
| **Number of Features** | 14 hardware specifications |
| **Total Samples** | 120 balanced samples (30 per class) |
| **Price Classes** | 4 tiers: Low Cost (0), Mid Range (1), Upper Mid (2), Premium (3) |
| **Cross-Validation Accuracy**| **95.0%** (Stratified 5-Fold) |
