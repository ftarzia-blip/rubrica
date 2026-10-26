const API_URL = window.RUBRICA_API_URL || "http://127.0.0.1:8000/rubrica";

const styles = `
  :root {
    color-scheme: light;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #202b27;
    background: #f6f7f3;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }

  * { box-sizing: border-box; }
  body { margin: 0; min-width: 320px; background: #f6f7f3; }
  button, input { font: inherit; }

  .rubrica-page {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 10% 0%, rgba(215, 235, 221, .6), transparent 32rem),
      #f6f7f3;
  }

  .rubrica-header {
    padding: 34px max(24px, calc((100vw - 1180px) / 2)) 28px;
    background: rgba(255, 255, 255, .72);
    border-bottom: 1px solid #e8ece6;
  }

  .rubrica-header-inner, .rubrica-content {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .rubrica-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 36px;
    color: #277451;
    font-size: 14px;
    font-weight: 750;
    letter-spacing: .04em;
  }

  .rubrica-brand-mark {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 13px;
    background: #e5f2e8;
  }

  .rubrica-brand-mark svg { width: 21px; height: 21px; }
  .rubrica-heading-row { display: flex; justify-content: space-between; align-items: end; gap: 24px; }
  .rubrica-eyebrow { margin: 0 0 8px; color: #718078; font-size: 13px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; }
  .rubrica-title { margin: 0; color: #1f3028; font-size: clamp(32px, 5vw, 48px); line-height: 1.08; letter-spacing: -.045em; }
  .rubrica-subtitle { margin: 12px 0 0; color: #718078; font-size: 15px; }
  .rubrica-total {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 15px;
    border: 1px solid #e4ebe4;
    border-radius: 14px;
    background: #fff;
    color: #456052;
    font-size: 14px;
    font-weight: 650;
    white-space: nowrap;
  }

  .rubrica-total strong { color: #246d49; font-size: 18px; }
  .rubrica-content { padding: 28px 24px 56px; }
  .rubrica-toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
  .rubrica-search-wrap { position: relative; flex: 1; max-width: 420px; }
  .rubrica-search-icon {
    position: absolute;
    top: 50%;
    left: 15px;
    width: 18px;
    height: 18px;
    color: #89968d;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .rubrica-search {
    width: 100%;
    height: 48px;
    padding: 0 16px 0 44px;
    border: 1px solid #e2e8e1;
    border-radius: 14px;
    outline: none;
    background: #fff;
    color: #23332b;
    transition: border-color .18s, box-shadow .18s;
  }

  .rubrica-search::placeholder { color: #9aa59e; }
  .rubrica-search:focus { border-color: #72a989; box-shadow: 0 0 0 4px rgba(75, 144, 101, .12); }
  .rubrica-result-count { margin: 0 0 0 auto; color: #77847b; font-size: 14px; white-space: nowrap; }
  .rubrica-filters { display: flex; flex-wrap: wrap; gap: 9px; margin: 0 0 24px; }
  .rubrica-filter {
    padding: 8px 14px;
    border: 1px solid #e2e8e1;
    border-radius: 999px;
    background: rgba(255, 255, 255, .72);
    color: #607067;
    cursor: pointer;
    font-size: 13px;
    font-weight: 620;
    transition: background .16s, border-color .16s, color .16s;
  }

  .rubrica-filter:hover { border-color: #aac8b2; color: #276d49; }
  .rubrica-filter[aria-pressed="true"] { border-color: #2e8054; background: #2e8054; color: #fff; }
  .rubrica-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .rubrica-card {
    min-width: 0;
    padding: 20px;
    border: 1px solid #e7ebe5;
    border-radius: 19px;
    background: #fff;
    box-shadow: 0 5px 18px rgba(42, 66, 49, .035);
    transition: transform .18s, box-shadow .18s, border-color .18s;
  }

  .rubrica-card:hover { transform: translateY(-3px); border-color: #d3e2d5; box-shadow: 0 12px 28px rgba(42, 66, 49, .09); }
  .rubrica-card-top { display: flex; align-items: flex-start; gap: 13px; }
  .rubrica-avatar {
    display: grid;
    flex: 0 0 48px;
    width: 48px;
    height: 48px;
    place-items: center;
    border-radius: 16px;
    background: hsl(var(--avatar-hue) 48% 93%);
    color: hsl(var(--avatar-hue) 42% 34%);
    font-size: 15px;
    font-weight: 750;
    letter-spacing: .02em;
  }

  .rubrica-person { min-width: 0; flex: 1; }
  .rubrica-name { overflow: hidden; margin: 2px 0 5px; color: #26372e; font-size: 16px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
  .rubrica-group { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #edf5ef; color: #397651; font-size: 11px; font-weight: 700; }
  .rubrica-details { display: grid; gap: 12px; margin-top: 20px; }
  .rubrica-detail { display: flex; align-items: flex-start; gap: 10px; min-width: 0; color: #718078; font-size: 13px; line-height: 1.45; }
  .rubrica-detail svg { flex: 0 0 16px; width: 16px; height: 16px; margin-top: 1px; color: #92a096; }
  .rubrica-detail span, .rubrica-detail a { overflow-wrap: anywhere; }
  .rubrica-detail a { color: #465d4f; text-decoration: none; }
  .rubrica-detail a:hover { color: #227148; text-decoration: underline; }
  .rubrica-state { grid-column: 1 / -1; padding: 56px 24px; border: 1px dashed #d8e2d8; border-radius: 18px; color: #718078; text-align: center; }
  .rubrica-state strong { display: block; margin-bottom: 7px; color: #33463a; font-size: 17px; }
  .rubrica-retry { margin-top: 15px; padding: 9px 14px; border: 0; border-radius: 10px; background: #2e8054; color: #fff; cursor: pointer; font-weight: 650; }
  .rubrica-retry:hover { background: #246a45; }

  @media (max-width: 900px) { .rubrica-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 620px) {
    .rubrica-header { padding: 24px 20px 23px; }
    .rubrica-brand { margin-bottom: 27px; }
    .rubrica-heading-row { align-items: flex-start; flex-direction: column; gap: 17px; }
    .rubrica-content { padding: 22px 20px 40px; }
    .rubrica-toolbar { align-items: stretch; flex-direction: column; gap: 11px; }
    .rubrica-search-wrap { max-width: none; }
    .rubrica-result-count { margin-left: 2px; }
    .rubrica-grid { grid-template-columns: 1fr; }
  }
`;

const icons = {
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="2.3"/><path d="M5.8 16c.7-1.7 1.8-2.5 3.2-2.5s2.5.8 3.2 2.5M15 9h3m-3 4h3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.2 3.5h3l1.5 4-2 1.6a15 15 0 0 0 5.2 5.2l1.6-2 4 1.5v3c0 1.1-.9 2-2 2C10 18.8 5.2 14 5.2 7.5c0-1.1.9-2 2-2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m4.5 7 7.5 5.5L19.5 7"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></svg>',
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function contactDetail(icon, value, href) {
  const row = element("div", "rubrica-detail");
  row.innerHTML = icon;
  const content = href ? element("a") : element("span");
  content.textContent = value || "Non disponibile";
  if (href && value) content.href = href;
  if (href && value) content.rel = "noopener noreferrer";
  row.append(content);
  return row;
}

function createPage(root) {
  const style = element("style");
  style.id = "rubrica-styles";
  style.textContent = styles;
  document.head.append(style);

  const page = element("div", "rubrica-page");
  const header = element("header", "rubrica-header");
  const headerInner = element("div", "rubrica-header-inner");
  const brand = element("div", "rubrica-brand");
  const mark = element("span", "rubrica-brand-mark");
  mark.innerHTML = icons.book;
  brand.append(mark, element("span", "", "RUBRICA"));

  const headingRow = element("div", "rubrica-heading-row");
  const heading = element("div");
  heading.append(
    element("p", "rubrica-eyebrow", "Le persone che contano"),
    element("h1", "rubrica-title", "I tuoi contatti"),
    element("p", "rubrica-subtitle", "Tutti i tuoi contatti, raccolti in un unico posto.")
  );
  const total = element("div", "rubrica-total");
  total.setAttribute("aria-live", "polite");
  total.append(element("strong", "rubrica-total-number", "—"), element("span", "", "contatti"));
  headingRow.append(heading, total);
  headerInner.append(brand, headingRow);
  header.append(headerInner);

  const content = element("main", "rubrica-content");
  const toolbar = element("div", "rubrica-toolbar");
  const searchWrap = element("label", "rubrica-search-wrap");
  const searchIcon = element("span");
  searchIcon.innerHTML = icons.search;
  searchIcon.className = "rubrica-search-icon";
  const search = element("input", "rubrica-search");
  search.type = "search";
  search.placeholder = "Cerca nome, email, città...";
  search.setAttribute("aria-label", "Cerca contatti");
  searchWrap.append(searchIcon, search);
  const resultCount = element("p", "rubrica-result-count", "Caricamento contatti...");
  resultCount.setAttribute("aria-live", "polite");
  toolbar.append(searchWrap, resultCount);

  const filters = element("nav", "rubrica-filters");
  filters.setAttribute("aria-label", "Filtra per gruppo");
  const grid = element("section", "rubrica-grid");
  grid.setAttribute("aria-label", "Elenco contatti");
  content.append(toolbar, filters, grid);
  page.append(header, content);
  root.replaceChildren(page);

  return { search, resultCount, total, filters, grid };
}

function renderContacts(contacts, ui, activeGroup, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("it");
  const visibleContacts = contacts.filter((contact) => {
    const matchesGroup = activeGroup === "Tutti" || contact.Gruppo === activeGroup;
    const searchable = [
      contact.Nome,
      contact.Cognome,
      contact.Telefono,
      contact.Email,
      contact.Indirizzo,
      contact.Gruppo,
    ].join(" ").toLocaleLowerCase("it");
    return matchesGroup && searchable.includes(normalizedQuery);
  });

  ui.grid.replaceChildren();
  ui.resultCount.textContent = `${visibleContacts.length} ${visibleContacts.length === 1 ? "contatto" : "contatti"}${visibleContacts.length !== contacts.length ? ` su ${contacts.length}` : ""}`;

  if (!visibleContacts.length) {
    const empty = element("div", "rubrica-state");
    empty.append(
      element("strong", "", contacts.length ? "Nessun contatto trovato" : "La rubrica è vuota"),
      element("span", "", contacts.length ? "Prova a modificare la ricerca o il gruppo selezionato." : "Non ci sono ancora contatti da mostrare.")
    );
    ui.grid.append(empty);
    return;
  }

  for (const contact of visibleContacts) {
    const firstName = contact.Nome || "";
    const lastName = contact.Cognome || "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Contatto senza nome";
    const card = element("article", "rubrica-card");
    const top = element("div", "rubrica-card-top");
    const avatar = element("div", "rubrica-avatar", `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase("it") || "?");
    avatar.style.setProperty("--avatar-hue", String((name.codePointAt(0) || 0) * 7 % 360));
    avatar.setAttribute("aria-hidden", "true");
    const person = element("div", "rubrica-person");
    person.append(element("h2", "rubrica-name", name));
    if (contact.Gruppo) person.append(element("span", "rubrica-group", contact.Gruppo));
    top.append(avatar, person);

    const details = element("div", "rubrica-details");
    details.append(
      contactDetail(icons.phone, contact.Telefono, contact.Telefono ? `tel:${contact.Telefono.replace(/[^\d+]/g, "")}` : null),
      contactDetail(icons.mail, contact.Email, contact.Email ? `mailto:${contact.Email}` : null),
      contactDetail(icons.location, contact.Indirizzo, null)
    );
    card.append(top, details);
    ui.grid.append(card);
  }
}

async function loadContacts(ui) {
  ui.grid.replaceChildren();
  const loading = element("div", "rubrica-state", "Caricamento dei contatti...");
  ui.grid.append(loading);
  ui.resultCount.textContent = "Caricamento contatti...";

  let response;
  try {
    response = await fetch(API_URL);
  } catch (error) {
    showLoadError(ui, error);
    return;
  }

  if (!response.ok) {
    showLoadError(ui, new Error(`Il server ha risposto con ${response.status}.`));
    return;
  }

  let contacts;
  try {
    contacts = await response.json();
  } catch (error) {
    showLoadError(ui, error);
    return;
  }

  if (!Array.isArray(contacts)) {
    showLoadError(ui, new Error("La risposta del server non contiene un elenco di contatti."));
    return;
  }

  contacts.sort((a, b) => {
    const nameA = `${a.Cognome || ""} ${a.Nome || ""}`;
    const nameB = `${b.Cognome || ""} ${b.Nome || ""}`;
    return nameA.localeCompare(nameB, "it");
  });
  const groups = ["Tutti", ...new Set(contacts.map((contact) => contact.Gruppo).filter(Boolean))];
  let activeGroup = "Tutti";

  function renderFilters() {
    ui.filters.replaceChildren();
    for (const group of groups) {
      const button = element("button", "rubrica-filter", group);
      button.type = "button";
      button.setAttribute("aria-pressed", String(activeGroup === group));
      button.addEventListener("click", () => {
        activeGroup = group;
        renderFilters();
        renderContacts(contacts, ui, activeGroup, ui.search.value);
      });
      ui.filters.append(button);
    }
  }

  ui.total.querySelector(".rubrica-total-number").textContent = String(contacts.length);
  ui.search.disabled = false;
  ui.search.addEventListener("input", () => renderContacts(contacts, ui, activeGroup, ui.search.value));
  renderFilters();
  renderContacts(contacts, ui, activeGroup, ui.search.value);
}

function showLoadError(ui, error) {
  console.error("Impossibile caricare i contatti:", error);
  ui.resultCount.textContent = "Errore di caricamento";
  const state = element("div", "rubrica-state");
  state.append(
    element("strong", "", "Non riesco a raggiungere la rubrica"),
    element("span", "", "Verifica che il server sia avviato e riprova.")
  );
  const retry = element("button", "rubrica-retry", "Riprova");
  retry.type = "button";
  retry.addEventListener("click", () => loadContacts(ui));
  state.append(retry);
  ui.grid.replaceChildren(state);
}

function startRubrica() {
  const root = document.getElementById("rubrica-app") || document.body.appendChild(element("div"));
  root.id = "rubrica-app";
  const ui = createPage(root);
  ui.search.disabled = true;
  loadContacts(ui);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startRubrica, { once: true });
} else {
  startRubrica();
}