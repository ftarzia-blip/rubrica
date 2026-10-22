from csv import DictReader
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/rubrica")
def apri_rubrica():
    with open("rubrica.csv", "r") as file:
        reader = DictReader(file)
        return list(reader)
