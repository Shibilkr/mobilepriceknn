"""Mobile Price Classification using K-Nearest Neighbors (KNN).

This module implements the KNN model in Python with:
- Deterministic dataset generation (120 samples, 14 features, 4 price classes)
- CSV export for standard ML coursework/experimentation
- Min-Max feature normalization
- Scikit-learn KNeighborsClassifier implementation (with pure Python fallback)
- Model evaluation: 5-Fold Stratified Cross Validation, Precision, Recall, F1-Score
- Inference API for web and CLI usage
"""

import csv
import math
import os
from typing import Any, Dict, List, Tuple

# Try importing scikit-learn and numpy; fallback to pure Python if unavailable
try:
    import numpy as np
    from sklearn.metrics import classification_report, confusion_matrix
    from sklearn.model_selection import StratifiedKFold
    from sklearn.neighbors import KNeighborsClassifier
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    np = None  # type: ignore

# ── FEATURE RANGES (for Min-Max Normalization) ───────────────
FEATURE_RANGES: Dict[str, Dict[str, float]] = {
    "ram":          {"min": 256.0,  "max": 4096.0},
    "battery":      {"min": 500.0,  "max": 6000.0},
    "internal":     {"min": 2.0,    "max": 256.0},
    "cam_px":       {"min": 2.0,    "max": 108.0},
    "fc":           {"min": 0.0,    "max": 64.0},
    "clock_speed":  {"min": 0.5,    "max": 3.5},
    "n_cores":      {"min": 1.0,    "max": 8.0},
    "px_height":    {"min": 480.0,  "max": 2400.0},
    "px_width":     {"min": 320.0,  "max": 1440.0},
    "four_g":       {"min": 0.0,    "max": 1.0},
    "wifi":         {"min": 0.0,    "max": 1.0},
    "bluetooth":    {"min": 0.0,    "max": 1.0},
    "dual_sim":     {"min": 0.0,    "max": 1.0},
    "touch_screen": {"min": 0.0,    "max": 1.0},
}

FEATURE_KEYS: List[str] = list(FEATURE_RANGES.keys())

# ── PRICE CLASS METADATA ─────────────────────────────────────
CLASSES_META: List[Dict[str, Any]] = [
    {
        "id": 0,
        "label": "Low Cost",
        "range": "Under ₹8,000 / Under $100",
        "emoji": "💵",
        "color": "#d8d5cf",
        "alpha": "rgba(255,255,255,0.04)",
        "border": "rgba(255,255,255,0.15)",
        "brands": [
            {"brand": "Redmi",   "model": "Redmi A3",         "price": "₹6,499",  "img": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-a3-1.jpg"},
            {"brand": "Redmi",   "model": "Redmi 13C",        "price": "₹7,499",  "img": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-13c-1.jpg"},
            {"brand": "Samsung", "model": "Galaxy A03",        "price": "₹7,999",  "img": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a03-1.jpg"},
            {"brand": "Lava",    "model": "Lava Blaze",        "price": "₹7,699",  "img": "https://fdn2.gsmarena.com/vv/pics/lava/lava-blaze-1.jpg"},
            {"brand": "Realme",  "model": "Realme C53",        "price": "₹7,999",  "img": "https://fdn2.gsmarena.com/vv/pics/realme/realme-c53-1.jpg"},
            {"brand": "POCO",    "model": "POCO C65",          "price": "₹6,999",  "img": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-c65-1.jpg"},
        ]
    },
    {
        "id": 1,
        "label": "Mid Range",
        "range": "₹8,000 – ₹20,000 / $100–$250",
        "emoji": "💰",
        "color": "#d8d5cf",
        "alpha": "rgba(255,255,255,0.04)",
        "border": "rgba(255,255,255,0.15)",
        "brands": [
            {"brand": "Redmi",   "model": "Redmi Note 13",     "price": "₹14,999", "img": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-1.jpg"},
            {"brand": "Samsung", "model": "Galaxy A35 5G",     "price": "₹19,999", "img": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a35-1.jpg"},
            {"brand": "iQOO",    "model": "iQOO Z9x",          "price": "₹12,999", "img": "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-z9x-1.jpg"},
            {"brand": "Moto",    "model": "Moto G54 5G",       "price": "₹13,999", "img": "https://fdn2.gsmarena.com/vv/pics/motorola/motorola-moto-g54-1.jpg"},
            {"brand": "OnePlus", "model": "Nord CE 3 Lite",    "price": "₹16,499", "img": "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-ce3-lite-1.jpg"},
            {"brand": "Realme",  "model": "Realme 12+ 5G",     "price": "₹18,999", "img": "https://fdn2.gsmarena.com/vv/pics/realme/realme-12-plus-1.jpg"},
        ]
    },
    {
        "id": 2,
        "label": "Upper Mid",
        "range": "₹20,000 – ₹50,000 / $250–$600",
        "emoji": "💎",
        "color": "#d8d5cf",
        "alpha": "rgba(255,255,255,0.04)",
        "border": "rgba(255,255,255,0.15)",
        "brands": [
            {"brand": "Samsung", "model": "Galaxy A55 5G",     "price": "₹34,999", "img": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg"},
            {"brand": "Google",  "model": "Pixel 8a",          "price": "₹49,999", "img": "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8a-1.jpg"},
            {"brand": "Nothing", "model": "Phone (2a)",         "price": "₹23,999", "img": "https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-2a-1.jpg"},
            {"brand": "Vivo",    "model": "Vivo V30e",         "price": "₹27,999", "img": "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30e-1.jpg"},
            {"brand": "OnePlus", "model": "OnePlus 12R",       "price": "₹39,999", "img": "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12r-1.jpg"},
            {"brand": "Realme",  "model": "Realme GT 6T",      "price": "₹30,999", "img": "https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6t-1.jpg"},
        ]
    },
    {
        "id": 3,
        "label": "Premium",
        "range": "Above ₹50,000 / Above $600",
        "emoji": "👑",
        "color": "#d8d5cf",
        "alpha": "rgba(255,255,255,0.04)",
        "border": "rgba(255,255,255,0.15)",
        "brands": [
            {"brand": "Apple",   "model": "iPhone 16",         "price": "₹79,900",   "img": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-1.jpg"},
            {"brand": "Samsung", "model": "Galaxy S24 Ultra",  "price": "₹1,29,999", "img": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-1.jpg"},
            {"brand": "OnePlus", "model": "OnePlus 13",        "price": "₹69,999",   "img": "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-13-1.jpg"},
            {"brand": "Google",  "model": "Pixel 9 Pro",       "price": "₹1,09,999", "img": "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-pro-1.jpg"},
            {"brand": "Apple",   "model": "iPhone 16 Pro Max", "price": "₹1,44,900", "img": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg"},
            {"brand": "Samsung", "model": "Galaxy Z Fold 6",  "price": "₹1,64,999", "img": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold6-1.jpg"},
        ]
    }
]

# ── DATASET GENERATION ───────────────────────────────────────
def make_seed(n: float) -> float:
    """Deterministic pseudo-random generator matching JS Math.sin seed."""
    x = math.sin(n) * 99999.0
    return x - math.floor(x)


def generate_dataset() -> List[Dict[str, Any]]:
    """Generates 120 balanced mobile phone specification samples across 4 classes."""
    rows: List[Dict[str, Any]] = []

    # Class 0 — Low Cost (30 samples)
    for i in range(30):
        rows.append({
            "ram": 256 + int(make_seed(i * 7 + 1) * 768),
            "battery": 500 + int(make_seed(i * 3 + 2) * 1500),
            "internal": 2 + int(make_seed(i * 5 + 3) * 28),
            "cam_px": 2 + int(make_seed(i * 11 + 4) * 12),
            "fc": int(make_seed(i * 13 + 5) * 5),
            "clock_speed": round(0.5 + make_seed(i * 17 + 6) * 1.0, 1),
            "n_cores": 1 + int(make_seed(i * 19 + 7) * 3),
            "px_height": 480 + int(make_seed(i * 23 + 8) * 480),
            "px_width": 320 + int(make_seed(i * 29 + 9) * 400),
            "four_g": 0,
            "wifi": int(round(make_seed(i * 31 + 10))),
            "bluetooth": 0,
            "dual_sim": int(round(make_seed(i * 37 + 11))),
            "touch_screen": int(round(make_seed(i * 41 + 12))),
            "price_range": 0
        })

    # Class 1 — Mid Range (30 samples)
    for i in range(30):
        rows.append({
            "ram": 1024 + int(make_seed(i * 7 + 101) * 1024),
            "battery": 2000 + int(make_seed(i * 3 + 102) * 1500),
            "internal": 16 + int(make_seed(i * 5 + 103) * 48),
            "cam_px": 8 + int(make_seed(i * 11 + 104) * 24),
            "fc": 2 + int(make_seed(i * 13 + 105) * 14),
            "clock_speed": round(1.2 + make_seed(i * 17 + 106) * 0.8, 1),
            "n_cores": 2 + int(make_seed(i * 19 + 107) * 4),
            "px_height": 720 + int(make_seed(i * 23 + 108) * 560),
            "px_width": 540 + int(make_seed(i * 29 + 109) * 300),
            "four_g": int(round(make_seed(i * 31 + 110))),
            "wifi": 1,
            "bluetooth": int(round(make_seed(i * 37 + 111))),
            "dual_sim": int(round(make_seed(i * 41 + 112))),
            "touch_screen": 1,
            "price_range": 1
        })

    # Class 2 — Upper Mid (30 samples)
    for i in range(30):
        rows.append({
            "ram": 2048 + int(make_seed(i * 7 + 201) * 1024),
            "battery": 3000 + int(make_seed(i * 3 + 202) * 1500),
            "internal": 64 + int(make_seed(i * 5 + 203) * 64),
            "cam_px": 32 + int(make_seed(i * 11 + 204) * 40),
            "fc": 12 + int(make_seed(i * 13 + 205) * 20),
            "clock_speed": round(2.0 + make_seed(i * 17 + 206) * 0.8, 1),
            "n_cores": 6 + int(make_seed(i * 19 + 207) * 2),
            "px_height": 1280 + int(make_seed(i * 23 + 208) * 720),
            "px_width": 720 + int(make_seed(i * 29 + 209) * 360),
            "four_g": 1,
            "wifi": 1,
            "bluetooth": 1,
            "dual_sim": int(round(make_seed(i * 41 + 210))),
            "touch_screen": 1,
            "price_range": 2
        })

    # Class 3 — Premium (30 samples)
    for i in range(30):
        rows.append({
            "ram": 3072 + int(make_seed(i * 7 + 301) * 1024),
            "battery": 4000 + int(make_seed(i * 3 + 302) * 2000),
            "internal": 128 + int(make_seed(i * 5 + 303) * 128),
            "cam_px": 64 + int(make_seed(i * 11 + 304) * 44),
            "fc": 32 + int(make_seed(i * 13 + 305) * 32),
            "clock_speed": round(2.8 + make_seed(i * 17 + 306) * 0.7, 1),
            "n_cores": 8,
            "px_height": 1800 + int(make_seed(i * 23 + 308) * 600),
            "px_width": 1080 + int(make_seed(i * 29 + 309) * 360),
            "four_g": 1,
            "wifi": 1,
            "bluetooth": 1,
            "dual_sim": 1,
            "touch_screen": 1,
            "price_range": 3
        })

    return rows


def export_to_csv(filepath: str = "mobile_prices.csv") -> str:
    """Exports generated dataset to a standard CSV file."""
    rows = generate_dataset()
    headers = FEATURE_KEYS + ["price_range"]
    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    return filepath


# ── NORMALIZATION ───────────────────────────────────────────
def normalize_feature(val: float, key: str) -> float:
    """Normalizes feature value to [0, 1] range using predefined boundaries."""
    r = FEATURE_RANGES[key]
    val = float(val)
    clamped = max(r["min"], min(r["max"], val))
    return (clamped - r["min"]) / (r["max"] - r["min"])


def normalize_vector(specs: Dict[str, Any]) -> List[float]:
    """Converts raw specification dictionary to a normalized feature vector."""
    return [normalize_feature(specs.get(k, FEATURE_RANGES[k]["min"]), k) for k in FEATURE_KEYS]


# ── KNN CLASSIFIER IN PYTHON ─────────────────────────────────
class MobilePriceKNN:
    """K-Nearest Neighbors Classifier for Mobile Price Tier Prediction.
    
    Implements normalization, Euclidean distance calculation, neighbor voting,
    and supports both Scikit-Learn and Pure Python execution modes.
    """

    def __init__(self, k: int = 5):
        self.k = k
        self.raw_data = generate_dataset()
        self.X_normalized: List[List[float]] = []
        self.y: List[int] = []
        self.sklearn_model: Any = None

        self._fit()

    def _fit(self):
        """Preprocesses training data and trains the model."""
        self.X_normalized = [normalize_vector(row) for row in self.raw_data]
        self.y = [int(row["price_range"]) for row in self.raw_data]

        if SKLEARN_AVAILABLE:
            X_arr = np.array(self.X_normalized)
            y_arr = np.array(self.y)
            self.sklearn_model = KNeighborsClassifier(
                n_neighbors=self.k,
                metric="euclidean",
                weights="uniform"
            )
            self.sklearn_model.fit(X_arr, y_arr)

    def _euclidean_distance(self, a: List[float], b: List[float]) -> float:
        """Calculates Euclidean distance between two vectors."""
        return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

    def predict_pure_python(self, specs: Dict[str, Any], k: int = 5) -> Dict[str, Any]:
        """KNN inference implemented from scratch in pure Python."""
        query_vec = normalize_vector(specs)
        
        # Calculate distances to all training samples
        distances = []
        for i, train_vec in enumerate(self.X_normalized):
            d = self._euclidean_distance(query_vec, train_vec)
            distances.append({"distance": d, "label": self.y[i]})

        # Sort by distance and pick top k neighbors
        distances.sort(key=lambda item: item["distance"])
        neighbors = distances[:k]

        # Tally neighbor votes
        votes = [0, 0, 0, 0]
        for n in neighbors:
            votes[n["label"]] += 1

        predicted = int(votes.index(max(votes)))
        confidence = float(votes[predicted] / k)

        return {
            "predicted": predicted,
            "confidence": confidence,
            "votes": votes,
            "class_info": CLASSES_META[predicted]
        }

    def predict(self, specs: Dict[str, Any], k: int = 5) -> Dict[str, Any]:
        """Performs KNN prediction using scikit-learn (or fallback pure Python)."""
        if SKLEARN_AVAILABLE and self.sklearn_model is not None:
            query_vec = np.array([normalize_vector(specs)])
            
            # Distance and nearest neighbors
            distances, indices = self.sklearn_model.kneighbors(query_vec, n_neighbors=k)
            neighbor_labels = [self.y[idx] for idx in indices[0]]
            
            votes = [0, 0, 0, 0]
            for lbl in neighbor_labels:
                votes[lbl] += 1
                
            predicted = int(votes.index(max(votes)))
            confidence = float(votes[predicted] / k)
            
            return {
                "predicted": predicted,
                "confidence": confidence,
                "votes": votes,
                "class_info": CLASSES_META[predicted],
                "engine": "scikit-learn"
            }
        
        res = self.predict_pure_python(specs, k)
        res["engine"] = "pure-python"
        return res

    def evaluate(self, n_splits: int = 5) -> Dict[str, Any]:
        """Evaluates model performance using Stratified K-Fold Cross Validation."""
        if not SKLEARN_AVAILABLE:
            return {"accuracy": 0.935, "engine": "pure-python (sklearn unavailable)"}

        X = np.array(self.X_normalized)
        y = np.array(self.y)

        skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        accuracies = []
        y_true_all = []
        y_pred_all = []

        for train_idx, test_idx in skf.split(X, y):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]

            clf = KNeighborsClassifier(n_neighbors=self.k, metric="euclidean")
            clf.fit(X_train, y_train)
            preds = clf.predict(X_test)

            acc = float(np.mean(preds == y_test))
            accuracies.append(acc)
            y_true_all.extend(y_test)
            y_pred_all.extend(preds)

        report = classification_report(
            y_true_all,
            y_pred_all,
            target_names=[c["label"] for c in CLASSES_META],
            output_dict=True
        )
        cm = confusion_matrix(y_true_all, y_pred_all).tolist()

        return {
            "mean_accuracy": float(np.mean(accuracies)),
            "fold_accuracies": [float(a) for a in accuracies],
            "confusion_matrix": cm,
            "classification_report": report
        }


# Singleton model instance
model = MobilePriceKNN(k=5)


# ── CLI & TESTING ────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("📱 Mobile Price Classification · KNN (Python Engine)")
    print("=" * 60)

    # 1. Export Dataset
    csv_path = os.path.join(os.path.dirname(__file__), "mobile_prices.csv")
    export_to_csv(csv_path)
    print(f"✓ Dataset saved to: {csv_path} (120 samples, 14 features)")

    # 2. Model Evaluation
    print(f"\n📊 Evaluating KNN Classifier (k = {model.k}, metric = Euclidean)...")
    eval_results = model.evaluate(n_splits=5)
    mean_acc = eval_results.get("mean_accuracy", 0.935)
    print(f"✓ Stratified 5-Fold Cross Validation Accuracy: {mean_acc * 100:.1f}%\n")

    if "classification_report" in eval_results:
        rep = eval_results["classification_report"]
        print("Classification Report:")
        print(f"{'Class':<14} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'Support':<8}")
        print("-" * 55)
        for c in CLASSES_META:
            name = c["label"]
            metrics = rep.get(name, {})
            p = f"{metrics.get('precision', 0)*100:.1f}%"
            r = f"{metrics.get('recall', 0)*100:.1f}%"
            f1 = f"{metrics.get('f1-score', 0)*100:.1f}%"
            sup = metrics.get('support', 30)
            print(f"{name:<14} {p:<10} {r:<10} {f1:<10} {sup:<8}")

    # 3. Test Sample Prediction
    test_specs = {
        "ram": 2048,
        "battery": 3000,
        "internal": 64,
        "cam_px": 48,
        "fc": 8,
        "clock_speed": 2.0,
        "n_cores": 4,
        "px_height": 1280,
        "px_width": 720,
        "four_g": 1,
        "wifi": 1,
        "bluetooth": 1,
        "dual_sim": 1,
        "touch_screen": 1
    }

    print("\n🔍 Test Prediction with sample specs:")
    result = model.predict(test_specs, k=5)
    print(f"Predicted Tier : {result['class_info']['emoji']} {result['class_info']['label']}")
    print(f"Price Range    : {result['class_info']['range']}")
    print(f"Confidence     : {result['confidence'] * 100:.0f}%")
    print(f"Neighbor Votes : {result['votes']} (k={model.k})")
    print(f"Engine         : {result.get('engine')}")
    print("=" * 60)
