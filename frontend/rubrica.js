const URL_API = window.RUBRICA_API_URL || "http://127.0.0.1:8000";

const seleziona = function (selettore) {
  return document.querySelector(selettore);
};

const campi = ["Nome", "Cognome", "Telefono", "Email", "Indirizzo", "Gruppo"];

const inputDelModulo = {};
for (let i = 0; i < campi.length; i++) {
  const nomeCampo = campi[i];
  const selettore = `[name="${nomeCampo}"]`;
  inputDelModulo[nomeCampo] = seleziona(selettore);
}

const interfaccia = {
  aggiungiButton: seleziona("#rubrica-add-button"),
  annullaButton: seleziona("#rubrica-cancel-button"),
  filtri: seleziona("#rubrica-filters"),
  form: seleziona("#rubrica-add-form"),
  statoForm: seleziona("#rubrica-form-status"),
  titoloForm: seleziona("#rubrica-form-title"),
  griglia: seleziona("#rubrica-grid"),
  conteggioRisultati: seleziona("#rubrica-result-count"),
  ricerca: seleziona("#rubrica-search"),
  salvaButton: seleziona("#rubrica-submit-button"),
  totale: seleziona("#rubrica-total-number"),
};

let contatti = [];
let gruppoAttivo = "Tutti";
let contattoInModifica = null;

function creaElemento(tag, classe = "", testo) {
  const nodo = document.createElement(tag);
  if (classe) nodo.className = classe;
  if (testo !== undefined) nodo.textContent = testo;
  return nodo;
}

function dettaglioContatto(etichetta, valore, collegamento) {
  const riga = creaElemento("div", "rubrica-detail");
  const contenuto = collegamento && valore ? creaElemento("a", "", valore) : creaElemento("span", "", valore || "Non disponibile");

  if (collegamento && valore) {
    contenuto.href = collegamento;
    contenuto.rel = "noopener noreferrer";
  }

  riga.append(creaElemento("strong", "", `${etichetta}:`), contenuto);
  return riga;
}

function mostraContatti() {
  const testoRicerca = interfaccia.ricerca.value.trim().toLocaleLowerCase("it");
  const contattiVisibili = contatti.filter((contatto) => {
    const appartieneAlGruppo = gruppoAttivo === "Tutti" || contatto.Gruppo === gruppoAttivo;
    const testoCercabile = campi.map((campo) => contatto[campo] || "").join(" ").toLocaleLowerCase("it");
    return appartieneAlGruppo && testoCercabile.includes(testoRicerca);
  });

  interfaccia.griglia.replaceChildren();
  interfaccia.conteggioRisultati.textContent = `${contattiVisibili.length} ${contattiVisibili.length === 1 ? "contatto" : "contatti"}${contattiVisibili.length !== contatti.length ? ` su ${contatti.length}` : ""}`;

  if (!contattiVisibili.length) {
    const vuoto = creaElemento("div", "rubrica-state");
    vuoto.append(
      creaElemento("strong", "", contatti.length ? "Nessun contatto trovato" : "La rubrica è vuota"),
      creaElemento("span", "", contatti.length ? "Prova a modificare la ricerca o il gruppo selezionato." : "Non ci sono ancora contatti da mostrare.")
    );
    interfaccia.griglia.append(vuoto);
    return;
  }

  for (const contatto of contattiVisibili) {
    const nome = contatto.Nome || "";
    const cognome = contatto.Cognome || "";
    const nomeCompleto = [nome, cognome].filter(Boolean).join(" ") || "Contatto senza nome";
    const card = creaElemento("article", "rubrica-card");
    const avatar = creaElemento("div", "rubrica-avatar", `${nome.charAt(0)}${cognome.charAt(0)}`.toLocaleUpperCase("it") || "?");
    avatar.style.setProperty("--avatar-hue", String((nomeCompleto.codePointAt(0) || 0) * 7 % 360));
    avatar.setAttribute("aria-hidden", "true");

    const persona = creaElemento("div", "rubrica-person");
    persona.append(creaElemento("h2", "rubrica-name", nomeCompleto));
    if (contatto.Gruppo) persona.append(creaElemento("span", "rubrica-group", contatto.Gruppo));

    const intestazione = creaElemento("div", "rubrica-card-top");
    intestazione.append(avatar, persona);

    const dettagli = creaElemento("div", "rubrica-details");
    dettagli.append(
      dettaglioContatto("Telefono", contatto.Telefono, contatto.Telefono && `tel:${contatto.Telefono.replace(/[^\d+]/g, "")}`),
      dettaglioContatto("Email", contatto.Email, contatto.Email && `mailto:${contatto.Email}`),
      dettaglioContatto("Indirizzo", contatto.Indirizzo)
    );

    const azioni = creaElemento("div", "rubrica-card-actions");
    const modifica = creaElemento("button", "rubrica-card-action", "Modifica");
    modifica.type = "button";
    modifica.setAttribute("aria-label", `Modifica ${nomeCompleto}`);
    modifica.addEventListener("click", () => avviaModifica(contatto));

    const elimina = creaElemento("button", "rubrica-card-action rubrica-card-action-delete", "Elimina");
    elimina.type = "button";
    elimina.setAttribute("aria-label", `Elimina ${nomeCompleto}`);
    elimina.addEventListener("click", () => eliminaContatto(contatto, elimina));

    azioni.append(modifica, elimina);
    card.append(intestazione, dettagli, azioni);
    interfaccia.griglia.append(card);
  }
}

function mostraFiltri() {
  const gruppi = ["Tutti", ...new Set(contatti.map((contatto) => contatto.Gruppo).filter(Boolean))];
  if (!gruppi.includes(gruppoAttivo)) gruppoAttivo = "Tutti";

  interfaccia.filtri.replaceChildren();
  for (const gruppo of gruppi) {
    const pulsante = creaElemento("button", "rubrica-filter", gruppo);
    pulsante.type = "button";
    pulsante.setAttribute("aria-pressed", String(gruppo === gruppoAttivo));
    pulsante.addEventListener("click", () => {
      gruppoAttivo = gruppo;
      mostraFiltri();
      mostraContatti();
    });
    interfaccia.filtri.append(pulsante);
  }
}

function aggiornaVista() {
  interfaccia.totale.textContent = String(contatti.length);
  mostraFiltri();
  mostraContatti();
}

function impostaModalitaModulo(contatto = null) {
  contattoInModifica = contatto;
  interfaccia.titoloForm.textContent = contatto ? "Modifica contatto" : "Nuovo contatto";
  interfaccia.salvaButton.textContent = contatto ? "Salva modifiche" : "Salva contatto";
  interfaccia.statoForm.textContent = "";

  for (const campo of campi) {
    inputDelModulo[campo].value = contatto ? contatto[campo] || "" : "";
  }
}

function chiudiModulo() {
  interfaccia.form.reset();
  impostaModalitaModulo();
  interfaccia.form.hidden = true;
  interfaccia.aggiungiButton.setAttribute("aria-expanded", "false");
}

function avviaModifica(contatto) {
  impostaModalitaModulo(contatto);
  interfaccia.form.hidden = false;
  interfaccia.aggiungiButton.setAttribute("aria-expanded", "true");
  inputDelModulo.Nome.focus();
  interfaccia.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function eliminaContatto(contatto, pulsante) {
  const nome = [contatto.Nome, contatto.Cognome].filter(Boolean).join(" ") || "questo contatto";
  if (!window.confirm(`Vuoi eliminare ${nome}?`)) return;

  pulsante.disabled = true;
  try {
    const risposta = await fetch(`${URL_API}/rubrica/elimina/${encodeURIComponent(contatto.ID)}`, { method: "POST" });
    if (!risposta.ok) throw new Error(`Il server ha risposto con ${risposta.status}.`);
    contatti = contatti.filter((item) => item.ID !== contatto.ID);
    if (contattoInModifica && contattoInModifica.ID === contatto.ID) chiudiModulo();
    aggiornaVista();
  } catch (errore) {
    console.error("Impossibile eliminare il contatto:", errore);
    window.alert("Non è stato possibile eliminare il contatto. Verifica che il server sia disponibile e riprova.");
    pulsante.disabled = false;
  }
}

async function salvaContatto(evento) {
  evento.preventDefault();
  interfaccia.statoForm.textContent = "";

  const pulsanti = [...interfaccia.form.querySelectorAll("button")];
  pulsanti.forEach((pulsante) => {
    pulsante.disabled = true;
  });

  const contatto = Object.fromEntries(campi.map((campo) => [campo, inputDelModulo[campo].value.trim()]));
  const contattoDaModificare = contattoInModifica;

  try {
    const risposta = await fetch(
      contattoDaModificare ? `${URL_API}/rubrica/modifica/${encodeURIComponent(contattoDaModificare.ID)}` : `${URL_API}/rubrica/aggiungi`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contatto),
      }
    );

    if (!risposta.ok) throw new Error(`Il server ha risposto con ${risposta.status}.`);

    const risultato = await risposta.json();
    if (contattoDaModificare) Object.assign(contattoDaModificare, contatto);
    else contatti.push({ ...contatto, ID: risultato.contatto_ID });

    contatti.sort((a, b) => `${a.Cognome || ""} ${a.Nome || ""}`.localeCompare(`${b.Cognome || ""} ${b.Nome || ""}`, "it"));
    gruppoAttivo = "Tutti";
    interfaccia.ricerca.value = "";
    chiudiModulo();
    aggiornaVista();
  } catch (errore) {
    console.error(contattoDaModificare ? "Impossibile modificare il contatto:" : "Impossibile aggiungere il contatto:", errore);
    interfaccia.statoForm.textContent = contattoDaModificare
      ? "Non è stato possibile modificare il contatto. Verifica che il server sia disponibile e riprova."
      : "Non è stato possibile salvare il contatto. Verifica che il server sia disponibile e riprova.";
  } finally {
    pulsanti.forEach((pulsante) => {
      pulsante.disabled = false;
    });
  }
}

function mostraErroreCaricamento(errore) {
  console.error("Impossibile caricare i contatti:", errore);
  interfaccia.conteggioRisultati.textContent = "Errore di caricamento";

  const stato = creaElemento("div", "rubrica-state");
  stato.append(
    creaElemento("strong", "", "Non riesco a raggiungere la rubrica"),
    creaElemento("span", "", "Verifica che il server sia avviato e riprova.")
  );

  const riprova = creaElemento("button", "rubrica-retry", "Riprova");
  riprova.type = "button";
  riprova.addEventListener("click", caricaContatti);
  stato.append(riprova);

  interfaccia.griglia.replaceChildren(stato);
}

async function caricaContatti() {
  interfaccia.griglia.replaceChildren(creaElemento("div", "rubrica-state", "Caricamento dei contatti..."));
  interfaccia.conteggioRisultati.textContent = "Caricamento contatti...";

  try {
    const risposta = await fetch(`${URL_API}/contatti`);
    if (!risposta.ok) throw new Error(`Il server ha risposto con ${risposta.status}.`);

    const risultato = await risposta.json();
    if (!Array.isArray(risultato)) throw new Error("La risposta del server non contiene un elenco di contatti.");

    contatti = risultato;
    contatti.sort((a, b) => `${a.Cognome || ""} ${a.Nome || ""}`.localeCompare(`${b.Cognome || ""} ${b.Nome || ""}`, "it"));
    interfaccia.ricerca.disabled = false;
    aggiornaVista();
  } catch (errore) {
    mostraErroreCaricamento(errore);
  }
}

interfaccia.aggiungiButton.addEventListener("click", () => {
  if (contattoInModifica) {
    interfaccia.form.reset();
    impostaModalitaModulo();
  } else {
    interfaccia.form.hidden = !interfaccia.form.hidden;
    interfaccia.aggiungiButton.setAttribute("aria-expanded", String(!interfaccia.form.hidden));
    if (!interfaccia.form.hidden) inputDelModulo.Nome.focus();
  }
});

interfaccia.annullaButton.addEventListener("click", chiudiModulo);
interfaccia.form.addEventListener("submit", salvaContatto);
interfaccia.ricerca.addEventListener("input", mostraContatti);
caricaContatti();
