import re
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"

MODEL_FILE = MODEL_DIR / "model.pkl"
VECTORIZER_FILE = MODEL_DIR / "vectorizer.pkl"


app = FastAPI(
    title="Bangla Sentiment AI",
    description="Bangla Sentiment Analysis API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


model = None
vectorizer = None
model_error = None


def load_model():

    global model
    global vectorizer
    global model_error

    try:

        if not MODEL_FILE.exists():
            model_error = "model/model.pkl not found"
            return

        if not VECTORIZER_FILE.exists():
            model_error = "model/vectorizer.pkl not found"
            return

        model = joblib.load(MODEL_FILE)
        vectorizer = joblib.load(VECTORIZER_FILE)

        model_error = None

    except Exception as error:

        model = None
        vectorizer = None
        model_error = str(error)


def clean_text(text):

    text = str(text).strip()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text


load_model()


class PredictRequest(BaseModel):

    text: str = Field(
        ...,
        min_length=1,
        max_length=5000
    )


@app.get("/")
def home():

    return {
        "name": "Bangla Sentiment AI",
        "status": "online" if model else "model_not_loaded",
        "version": "1.0.0",
        "message": "Bangla Sentiment AI API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "ok" if model else "error",
        "model_loaded": model is not None,
        "error": model_error
    }


@app.post("/predict")
def predict(request: PredictRequest):

    if model is None or vectorizer is None:

        raise HTTPException(
            status_code=503,
            detail=model_error or "AI model is not loaded"
        )


    text = clean_text(
        request.text
    )


    if not text:

        raise HTTPException(
            status_code=422,
            detail="Text cannot be empty"
        )


    try:

        vector = vectorizer.transform(
            [text]
        )


        prediction = model.predict(
            vector
        )[0]


        probabilities = {}
        confidence = 1.0


        if hasattr(
            model,
            "predict_proba"
        ):

            probs = model.predict_proba(
                vector
            )[0]

            classes = model.classes_


            probabilities = {

                str(label): round(
                    float(probability),
                    6
                )

                for label, probability
                in zip(classes, probs)

            }


            if probabilities:

                confidence = max(
                    probabilities.values()
                )


        return {

            "success": True,

            "text": text,

            "sentiment": str(
                prediction
            ),

            "confidence": round(
                float(confidence),
                6
            ),

            "probabilities": probabilities

        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
