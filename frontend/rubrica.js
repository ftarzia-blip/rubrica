const API_URL = window.RUBRICA_API_URL || "http://127.0.0.1:8000";
const $ = (selector) => document.querySelector(selector);
const fields = ["Nome", "Cognome", "Telefono", "Email", "Indirizzo", "Gruppo"];
const inputs = Object.fromEntries(fields.map((name) => [name, $(`[name="${name}"]`)]));
const ui = {
  addButton: $("#rubrica-add-button"),
  cancelButton: $("#rubrica-cancel-button"),
  filters: $("#rubrica-filters"),
  form: $("#rubrica-add-form"),
  formStatus: $("#rubrica-form-status"),
  formTitle: $("#rubrica-form-title"),
  grid: $("#rubrica-grid"),
  resultCount: $("#rubrica-result-count"),
  search: $("#rubrica-search"),
  submitButton: $("#rubrica-submit-button"),
  total: $("#rubrica-total-number"),

};

let contacts = [];
let activeGroup = "Tutti";
let editingContact = null;

function element(tag, className = "", text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function contactDetail(label, value, href) {
  const row = element("div", "rubrica-detail");
  const content = href && value ? element("a", "", value) : element("span", "", value || "Non disponibile");
  if (href && value) {
    content.href = href;
    content.rel = "noopener noreferrer";
  }
  row.append(element("strong", "", `${label}:`), content);
  return row;
}

function renderContacts() {
  const query = ui.search.value.trim().toLocaleLowerCase("it");
  const visible = contacts.filter((contact) => {
    const matchesGroup = activeGroup === "Tutti" || contact.Gruppo === activeGroup;
    const searchable = fields.map((field) => contact[field] || "").join(" ").toLocaleLowerCase("it");
    return matchesGroup && searchable.includes(query);
  });

  ui.grid.replaceChildren();
  ui.resultCount.textContent = `${visible.length} ${visible.length === 1 ? "contatto" : "contatti"}${visible.length !== contacts.length ? ` su ${contacts.length}` : ""}`;
  if (!visible.length) {
    const empty = element("div", "rubrica-state");
    empty.append(
      element("strong", "", contacts.length ? "Nessun contatto trovato" : "La rubrica è vuota"),
      element("span", "", contacts.length ? "Prova a modificare la ricerca o il gruppo selezionato." : "Non ci sono ancora contatti da mostrare.")
    );
    ui.grid.append(empty);
    return;
  }

  for (const contact of visible) {
    const first = contact.Nome || "";
    const last = contact.Cognome || "";
    const name = [first, last].filter(Boolean).join(" ") || "Contatto senza nome";
    const card = element("article", "rubrica-card");
    const avatar = element("div", "rubrica-avatar", `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase("it") || "?");
    avatar.style.setProperty("--avatar-hue", String((name.codePointAt(0) || 0) * 7 % 360));
    avatar.setAttribute("aria-hidden", "true");

    const person = element("div", "rubrica-person");
    person.append(element("h2", "rubrica-name", name));
    if (contact.Gruppo) person.append(element("span", "rubrica-group", contact.Gruppo));
    const top = element("div", "rubrica-card-top");
    top.append(avatar, person);

    const details = element("div", "rubrica-details");
    details.append(
      contactDetail("Telefono", contact.Telefono, contact.Telefono && `tel:${contact.Telefono.replace(/[^\d+]/g, "")}`),
      contactDetail("Email", contact.Email, contact.Email && `mailto:${contact.Email}`),
      contactDetail("Indirizzo", contact.Indirizzo)
    );

    const actions = element("div", "rubrica-card-actions");
    const edit = element("button", "rubrica-card-action", "Modifica");
    edit.type = "button";
    edit.setAttribute("aria-label", `Modifica ${name}`);
    edit.addEventListener("click", () => beginEditing(contact));
    const remove = element("button", "rubrica-card-action rubrica-card-action-delete", "Elimina");
    remove.type = "button";
    remove.setAttribute("aria-label", `Elimina ${name}`);
    remove.addEventListener("click", () => deleteContact(contact, remove));
    actions.append(edit, remove);
    card.append(top, details, actions);
    ui.grid.append(card);
  }
}

function renderFilters() {
  const groups = ["Tutti", ...new Set(contacts.map((contact) => contact.Gruppo).filter(Boolean))];
  if (!groups.includes(activeGroup)) activeGroup = "Tutti";
  ui.filters.replaceChildren();
  for (const group of groups) {
    const button = element("button", "rubrica-filter", group);
    button.type = "button";
    button.setAttribute("aria-pressed", String(group === activeGroup));
    button.addEventListener("click", () => {
      activeGroup = group;
      renderFilters();
      renderContacts();
    });
    ui.filters.append(button);
  }
}

function render() {
  ui.total.textContent = String(contacts.length);
  renderFilters();
  renderContacts();
}

function setFormMode(contact = null) {
  editingContact = contact;
  ui.formTitle.textContent = contact ? "Modifica contatto" : "Nuovo contatto";
  ui.submitButton.textContent = contact ? "Salva modifiche" : "Salva contatto";
  ui.formStatus.textContent = "";
  for (const field of fields) inputs[field].value = contact ? contact[field] || "" : "";
}

function closeForm() {
  ui.form.reset();
  setFormMode();
  ui.form.hidden = true;
  ui.addButton.setAttribute("aria-expanded", "false");
}

function beginEditing(contact) {
  setFormMode(contact);
  ui.form.hidden = false;
  ui.addButton.setAttribute("aria-expanded", "true");
  inputs.Nome.focus();
  ui.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteContact(contact, button) {
  const name = [contact.Nome, contact.Cognome].filter(Boolean).join(" ") || "questo contatto";
  if (!window.confirm(`Vuoi eliminare ${name}?`)) return;

  button.disabled = true;
  try {
    const response = await fetch(`${API_URL}/rubrica/elimina/${encodeURIComponent(contact.ID)}`, { method: "POST" });
    if (!response.ok) throw new Error(`Il server ha risposto con ${response.status}.`);
    contacts = contacts.filter((item) => item.ID !== contact.ID);
    if (editingContact && editingContact.ID === contact.ID) closeForm();
    render();
  } catch (error) {
    console.error("Impossibile eliminare il contatto:", error);
    window.alert("Non è stato possibile eliminare il contatto. Verifica che il server sia disponibile e riprova.");
    button.disabled = false;
  }
}

async function saveContact(event) {
  event.preventDefault();
  ui.formStatus.textContent = "";
  const buttons = [...ui.form.querySelectorAll("button")];
  buttons.forEach((button) => { button.disabled = true; });
  const contact = Object.fromEntries(fields.map((field) => [field, inputs[field].value.trim()]));
  const edited = editingContact;

  try {
    const response = await fetch(
      edited ? `${API_URL}/rubrica/modifica/${encodeURIComponent(edited.ID)}` : `${API_URL}/rubrica/aggiungi`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      }
    );
    if (!response.ok) throw new Error(`Il server ha risposto con ${response.status}.`);
    const result = await response.json();
    if (edited) Object.assign(edited, contact);
    else contacts.push({ ...contact, ID: result.contatto_ID });

    contacts.sort((a, b) => `${a.Cognome || ""} ${a.Nome || ""}`.localeCompare(`${b.Cognome || ""} ${b.Nome || ""}`, "it"));
    activeGroup = "Tutti";
    ui.search.value = "";
    closeForm();
    render();
  } catch (error) {
    console.error(edited ? "Impossibile modificare il contatto:" : "Impossibile aggiungere il contatto:", error);
    ui.formStatus.textContent = edited
      ? "Non è stato possibile modificare il contatto. Verifica che il server sia disponibile e riprova."
      : "Non è stato possibile salvare il contatto. Verifica che il server sia disponibile e riprova.";
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
  }
}

function showLoadError(error) {
  console.error("Impossibile caricare i contatti:", error);
  ui.resultCount.textContent = "Errore di caricamento";
  const state = element("div", "rubrica-state");
  state.append(
    element("strong", "", "Non riesco a raggiungere la rubrica"),
    element("span", "", "Verifica che il server sia avviato e riprova.")
  );
  const retry = element("button", "rubrica-retry", "Riprova");
  retry.type = "button";
  retry.addEventListener("click", loadContacts);
  state.append(retry);
  ui.grid.replaceChildren(state);
}

async function loadContacts() {
  ui.grid.replaceChildren(element("div", "rubrica-state", "Caricamento dei contatti..."));
  ui.resultCount.textContent = "Caricamento contatti...";
  try {
    const response = await fetch(`${API_URL}/contatti`);
    if (!response.ok) throw new Error(`Il server ha risposto con ${response.status}.`);
    const result = await response.json();
    if (!Array.isArray(result)) throw new Error("La risposta del server non contiene un elenco di contatti.");
    contacts = result;
    contacts.sort((a, b) => `${a.Cognome || ""} ${a.Nome || ""}`.localeCompare(`${b.Cognome || ""} ${b.Nome || ""}`, "it"));
    ui.search.disabled = false;
    render();
  } catch (error) {         
    showLoadError(error);
  }
}

ui.addButton.addEventListener("click", () => {
  if (editingContact) {
    ui.form.reset();
    setFormMode();
  } else {
    ui.form.hidden = !ui.form.hidden;
    ui.addButton.setAttribute("aria-expanded", String(!ui.form.hidden));
    if (!ui.form.hidden) inputs.Nome.focus();
  }
});
ui.cancelButton.addEventListener("click", closeForm);
ui.form.addEventListener("submit", saveContact);
ui.search.addEventListener("input", renderContacts);
loadContacts();



const API = "http://localhost:8000";
const apiFetch = async (percorso, opzioni = {}) => {
const token = localStorage.getItem("token");
const risposta = await fetch(API + percorso, {
...opzioni,
headers: { ...opzioni.headers, Authorization: `Bearer ${token}` },
});
if (risposta.status === 401) {
localStorage.removeItem("token");
mostraLogin(); // la tua funzione che riporta al form di login
throw new Error("Sessione scaduta: effettua di nuovo il login");
}
return risposta.json();
};


