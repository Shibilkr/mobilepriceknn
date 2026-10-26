"""Python Web Server for Mobile Price Classifier.

Runs the KNN machine learning model in Python using FastAPI/Uvicorn,
serving predictions and the interactive web interface.
"""

import os
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from knn_model import model, CLASSES_META, FEATURE_KEYS, FEATURE_RANGES

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(
    title="Mobile Price Classifier API",
    description="KNN Machine Learning Model for Phone Price Classification in Python",
    version="1.0.0"
)

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
async def serve_index():
    """Serves the main HTML interface."""
    index_path = os.path.join(BASE_DIR, "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)


@app.get("/style.css")
async def serve_css():
    """Serves the CSS styling."""
    css_path = os.path.join(BASE_DIR, "style.css")
    return FileResponse(css_path, media_type="text/css")


@app.get("/app.js")
async def serve_js():
    """Serves the frontend JavaScript."""
    js_path = os.path.join(BASE_DIR, "app.js")
    return FileResponse(js_path, media_type="application/javascript")


@app.post("/predict")
async def predict_price_range(specs: Dict[str, Any]):
    """Receives phone specifications, runs KNN in Python, and returns the prediction."""
    try:
        # Validate that required keys exist
        cleaned_specs = {}
        for k in FEATURE_KEYS:
            cleaned_specs[k] = float(specs.get(k, FEATURE_RANGES[k]["min"]))

        # Execute KNN inference in Python
        result = model.predict(cleaned_specs, k=model.k)
        return {
            "status": "success",
            "predicted": result["predicted"],
            "confidence": result["confidence"],
            "votes": result["votes"],
            "class_info": result["class_info"],
            "engine": result.get("engine", "python")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


@app.get("/api/model-info")
async def get_model_info():
    """Returns dataset features and evaluation metrics calculated in Python."""
    eval_metrics = model.evaluate(n_splits=5)
    return {
        "k": model.k,
        "features": FEATURE_KEYS,
        "ranges": FEATURE_RANGES,
        "classes": CLASSES_META,
        "training_samples": len(model.raw_data),
        "evaluation": eval_metrics
    }


if __name__ == "__main__":
    port = 8000
    print("=" * 60)
    print(f"🚀 Starting Python ML Server on http://127.0.0.1:{port}")
    print(f"📱 KNN Model loaded in Python (k = {model.k})")
    print("=" * 60)
    uvicorn.run("app:app", host="127.0.0.1", port=port, reload=True)
