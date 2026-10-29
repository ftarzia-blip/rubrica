import csv
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

#ID,Nome,Cognome,Telefono,Email,Indirizzo,Gruppo
class Contatto(BaseModel):
    ID : int | None = None #Indice 
    Nome : str   
    Cognome : str   
    Telefono : str
    Email : str
    Indirizzo : str | None = None
    Gruppo : str
    

app= FastAPI()                  #configurazione per consentire qualsiasi origine (aprire/disattivare restinzioni CORS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # accetta richieste da qualsiasi dominio
    allow_credentials=True,
    allow_methods=["*"],        # accetta qualsiasi metodo (GET,POST,ecc..)
    allow_headers=["*"],        # accetta qualsiasi intestazione
)

percorso = Path(__file__).resolve().parent / "rubrica.csv"

with percorso.open("r", encoding="utf-8", newline="") as file:
    lettore = csv.DictReader(file)
    rubrica = list(lettore)

@app.get("/contatti")
def get_contatti():
    return rubrica

@app.get("/contatti/cognome/{cognome}")
def get_cognome(cognome):
    risultati = []
    for contatto in rubrica:
        if contatto["Cognome"].lower() == cognome.lower():
            risultati.append(contatto)
    return risultati

@app.get("/contatti/nome/{nome}")
def get_nome(nome):
    risultati = []
    for contatto in rubrica:
        if contatto["Nome"].lower() == nome.lower():
            risultati.append(contatto)
    return risultati

def ultimo_id(rubrica):
    massimo = 0
    for contatto in rubrica:
        if int(contatto["ID"]) > massimo:
            massimo = int(contatto["ID"])
    return massimo

def salva_rubrica():
    campi_rubrica = ['ID', 'Nome', 'Cognome', 'Telefono', 'Email', 'Indirizzo', 'Gruppo']
    with percorso.open('w', encoding='utf-8', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=campi_rubrica)
        writer.writeheader()
        writer.writerows(rubrica)

@app.post("/rubrica/aggiungi")
def salva(nuovo_contatto : Contatto):
    nuovo_contatto.ID = ultimo_id(rubrica) +1
    rubrica.append(nuovo_contatto.model_dump())
    with percorso.open('a', encoding='utf-8', newline='') as csvfile:
        campi_rubrica = ['ID', 'Nome','Cognome', 'Telefono','Email', 'Indirizzo','Gruppo']
        writer = csv.DictWriter(csvfile, fieldnames=campi_rubrica)
        writer.writerow(nuovo_contatto.model_dump())
    return {
        "messaggio" : "Contatto aggiunto",
        "contatto_ID" : nuovo_contatto.ID
    }
@app.post("/rubrica/elimina/{indice}")
def elimina(indice: int):
    for contatto in rubrica:
        if int(contatto["ID"]) == indice:
            rubrica.remove(contatto)
            salva_rubrica()
            return {"messaggio": "Contatto eliminato"}

@app.post("/rubrica/modifica/{indice}")
def modifica(indice: int, nuovo_contatto: Contatto):
    for contatto in rubrica:
        if int(contatto["ID"])==indice: 
            contatto.update(nuovo_contatto.model_dump(exclude={"ID"}))
            salva_rubrica()
            return {"messaggio": "contatto salvato"} 
