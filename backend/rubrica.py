import csv
from pathlib import Path
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import jwt 
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

class Contatto(BaseModel):
    ID : int | None = None #Indice 
    Nome : str   
    Cognome : str   
    Telefono : str
    Email : str
    Indirizzo : str | None = None
    Gruppo : str
    

app= FastAPI()                 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,
    allow_methods=["*"],        
    allow_headers=["*"],       
)

SECRET_KEY = "segreto-di-sviluppo-da-cambiare"
ALGORITMO = "HS256"
DURATA_TOKEN_MINUTI = 30

percorso_utenti = Path(__file__).resolve().parent / "utenti.csv"

with percorso_utenti.open("r", encoding="utf-8", newline="") as file:
    utenti = list(csv.DictReader(file))


class Credenziali(BaseModel):
    username : str
    password : str


def cerca_utente(username, password):
    for utente in utenti:
        if utente["User"] == username and utente["Pass"] == password:
            return utente
    return None


def crea_token():
    scadenza = datetime.now(timezone.utc) + timedelta(minutes=DURATA_TOKEN_MINUTI)
    payload = {"exp": scadenza}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITMO)

schema_bearer = HTTPBearer(auto_error=False)


def utente_corrente(credenziali: HTTPAuthorizationCredentials | None = Depends(schema_bearer)):
    if credenziali is None:
        raise HTTPException(status_code=401, detail="Devi effettuare il login")
    try:
        return jwt.decode(credenziali.credentials, SECRET_KEY, algorithms=[ALGORITMO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token scaduto: effettua di nuovo il login")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")


@app.post("/login")
def login(credenziali : Credenziali):
    utente = cerca_utente(credenziali.username, credenziali.password)
    if utente is None:
        raise HTTPException(status_code=401, detail="Username o password errati")
    return {"access_token": crea_token(), "token_type": "bearer"}


percorso = Path(__file__).resolve().parent / "rubrica.csv"

with percorso.open("r", encoding="utf-8", newline="") as file:
    lettore = csv.DictReader(file)
    rubrica = list(lettore)

def cerca_ID(lista,indice):
    for contato in lista:
        if contato["ID"] == indice:
            return contato
    return
    

@app.get("/contatti")
def get_contatti():
    return rubrica

@app.get("/contatti/cognome/{cognome}")
def get_cognome(cognome: str):
    risultati = []
    for contatto in rubrica:
        if contatto["Cognome"].lower() == cognome.lower():
            risultati.append(contatto)
    return risultati

@app.get("/contatti/nome/{nome}")
def get_nome(nome: str):
    risultati = []
    for contatto in rubrica:
        if contatto["Nome"].lower() == nome.lower():
            risultati.append(contatto)
    return risultati


@app.get("/contatti/id/{ID}")
def get_utente_by_id(ID):
    x=cerca_ID(rubrica,ID)
    if not x:
        raise HTTPException(status_code=404, detail="Contatto non trovato")
    return x

def ultimo_id(rubrica):
    massimo = 0
    for contatto in rubrica:
        if int(contatto["ID"]) > massimo:
            massimo = int(contatto["ID"])
    return massimo

@app.post("/rubrica/aggiungi", dependencies=[Depends(utente_corrente)])  
def salva(nuovo_contatto : Contatto):
    nuovo_contatto.ID = ultimo_id(rubrica) +1
    rubrica.append(nuovo_contatto.model_dump())
    with open('rubrica.csv', 'a', newline='') as csvfile:
        campi_rubrica = ['ID', 'Nome','Cognome', 'Telefono','Email', 'Indirizzo','Gruppo']
        writer = csv.DictWriter(csvfile, fieldnames=campi_rubrica)
        writer.writerow(nuovo_contatto.model_dump())
    return {
        "messaggio" : "Contatto aggiunto",
        "contatto_ID" : nuovo_contatto.ID
    }

@app.post("/rubrica/elimina/{ID}", dependencies=[Depends(utente_corrente)])   
def elimina(ID):
    x=cerca_ID(rubrica,ID)
    if not x:
        return {"messagio":"Contatto non trovato"}
    rubrica.remove(x)
    with open('rubrica.csv', 'w', newline='',encoding="utf-8") as csvfile:
            campi_rubrica = ['ID', 'Nome','Cognome', 'Telefono','Email', 'Indirizzo','Gruppo']
            writer = csv.DictWriter(csvfile, fieldnames=campi_rubrica)
            writer.writeheader()
            writer.writerows(rubrica)
    return {"messaggio" : "Contatto eliminato"}

@app.post("/rubrica/modifica/{ID}", dependencies=[Depends(utente_corrente)])   
def modifica(ID:int,nuovo_contatto : Contatto):  
    x=cerca_ID(rubrica,ID)
    if not x:
        return {"messagio":"Contatto non trovato"}
    rubrica.remove(x)
    nuovo_contatto.ID = ID
    rubrica.append(nuovo_contatto.model_dump())
    with open('rubrica.csv', 'w', newline='',encoding="utf-8") as csvfile:
            campi_rubrica = ['ID', 'Nome','Cognome', 'Telefono','Email', 'Indirizzo','Gruppo']
            writer = csv.DictWriter(csvfile, fieldnames=campi_rubrica)
            writer.writeheader()
            writer.writerows(rubrica)
    return {"messaggio" : "Contatto modificato"}