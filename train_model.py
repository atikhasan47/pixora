from pathlib import Path
import csv
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "train.csv"
MODEL_DIR = BASE_DIR / "model"

MODEL_DIR.mkdir(exist_ok=True)


texts = []
labels = []


if not DATA_FILE.exists():
    raise FileNotFoundError(
        f"Training dataset not found: {DATA_FILE}"
    )


with open(DATA_FILE, "r", encoding="utf-8-sig") as file:

    reader = csv.DictReader(file)

    for row in reader:

        text = (row.get("text") or "").strip()
        label = (row.get("label") or "").strip()

        if text and label:
            texts.append(text)
            labels.append(label)


if len(texts) < 2:
    raise RuntimeError(
        "Training dataset is too small."
    )


if len(set(labels)) < 2:
    raise RuntimeError(
        "At least two sentiment labels are required."
    )


vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    min_df=1,
    sublinear_tf=True
)


X = vectorizer.fit_transform(texts)


model = MultinomialNB()
model.fit(X, labels)


joblib.dump(
    vectorizer,
    MODEL_DIR / "vectorizer.pkl"
)


joblib.dump(
    model,
    MODEL_DIR / "model.pkl"
)


print("================================")
print("Bangla Sentiment AI trained")
print("Training samples:", len(texts))
print("Labels:", sorted(set(labels)))
print("Model saved successfully.")
print("================================")
