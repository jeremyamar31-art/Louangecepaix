/* -------------------------------------------------
   Configuration générale
------------------------------------------------- */
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3t8tr68VdxmjMamPTnlQQuvpjISPBmAkiDHsZr_vSz5EHk-4Z8JQB58xS-4rAP-72dOi4Mr8FmR9i/pub?output=csv";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfjnD-BKH22nMH_Wq3me611ffIaSnI-BeQEDQ48lbWN0FZo2g/viewform";

const LOGO_FILENAME = "logo.png";

/* -------------------------------------------------
   Chargement des données CSV via PapaParse
------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadSheetData();
  setupUI();
});

let allSongs = []; // toutes les lignes du CSV
let filteredSongs = []; // après recherche + filtres

/* -------------------------------------------------
   1) Téléchargement du CSV Google Sheet
------------------------------------------------- */
function loadSheetData() {
  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      allSongs = results.data.map(normalizeRow);
      filteredSongs = [...allSongs];
      populateThemeFilter(allSongs);
      renderTable(filteredSongs);
    },
  });
}

/* -------------------------------------------------
   2) Normalisation d'une ligne CSV
------------------------------------------------- */
function normalizeRow(row) {
  const safe = (v) => (v ? v.trim() : "");

  return {
    titre: safe(row["Titre"] || row["title"]),
    auteur: safe(row["Auteur"] || row["author"]),
    recueil: safe(row["Recueil"] || ""),

    themes: safe(row["Thèmes"] || row["Themes"] || "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0),

    partition1: convertGoogleLink(safe(row["Partition (PDF)"] || "")),
    partition2: convertGoogleLink(safe(row["Partition (PDF 2)"] || "")),

    audioMelodie: convertGoogleLink(safe(row["Mélodie"] || "")),
    audioAlto: convertGoogleLink(safe(row["Alto"] || "")),
    audioTenor: convertGoogleLink(safe(row["Ténor"] || "")),

    references: safe(row["Références bibliques"] || row["Refs"] || ""),
  };
}

/* -------------------------------------------------
   Conversion des liens Google Drive → direct download
------------------------------------------------- */
function convertGoogleLink(url) {
  if (!url || !url.includes("drive.google.com")) return url;
  const idMatch = url.match(/\/d\/(.*?)\//);
  if (!idMatch) return url;
  return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
}

/* -------------------------------------------------
   3) Affichage du tableau principal
------------------------------------------------- */
function renderTable(data) {
  const tbody = document.querySelector("#songsTableBody");
  tbody.innerHTML = "";

  data.forEach((song) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="col-title">${song.titre}</td>
      <td class="col-small">${song.auteur}</td>
      <td class="col-small">${song.recueil}</td>
      <td>${renderThemeBadges(song.themes)}</td>
      <td>${renderPartitionBadges(song)}</td>
      <td>${renderAudioBadges(song)}</td>
      <td class="col-small">${song.references}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* -------------------------------------------------
   4) Badges Thèmes
------------------------------------------------- */
function renderThemeBadges(list) {
  return list
    .map((t) => `<span class="badge badge-theme">${t}</span>`)
    .join("");
}

/* -------------------------------------------------
   5) Badges Partition
------------------------------------------------- */
function renderPartitionBadges(s) {
  let out = "";

  if (s.partition1)
    out += `<a class="badge badge-link" href="${s.partition1}" target="_blank">PDF 1</a>`;

  if (s.partition2)
    out += `<a class="badge badge-link" href="${s.partition2}" target="_blank">PDF 2</a>`;

  return out || "";
}

/* -------------------------------------------------
   6) Badges Audio (moutarde)
------------------------------------------------- */
function renderAudioBadges(s) {
  let out = "";

  if (s.audioMelodie)
    out += `<a class="badge badge-audio" href="${s.audioMelodie}" target="_blank">Mélodie</a>`;

  if (s.audioAlto)
    out += `<a class="badge badge-audio" href="${s.audioAlto}" target="_blank">Alto</a>`;

  if (s.audioTenor)
    out += `<a class="badge badge-audio" href="${s.audioTenor}" target="_blank">Ténor</a>`;

  return out || "";
}

/* -------------------------------------------------
   7) Recherche + Filtre
------------------------------------------------- */
function setupUI() {
  document
    .querySelector("#searchInput")
    .addEventListener("input", applyFilters);

  document
    .querySelector("#themeFilter")
    .addEventListener("change", applyFilters);

  document.querySelector("#addSongBtn").addEventListener("click", () => {
    window.open(GOOGLE_FORM_URL, "_blank");
  });
}

function populateThemeFilter(all) {
  const select = document.querySelector("#themeFilter");
  const themes = new Set();

  all.forEach((song) => song.themes.forEach((t) => themes.add(t)));

  [...themes].sort().forEach((theme) => {
    const opt = document.createElement("option");
    opt.value = theme;
    opt.textContent = theme;
    select.appendChild(opt);
  });
}

/* -------------------------------------------------
   Filtrage principal — entièrement corrigé
------------------------------------------------- */
function applyFilters() {
  const q = document.querySelector("#searchInput").value.toLowerCase();
  const selectedTheme = document.querySelector("#themeFilter").value;

  filteredSongs = allSongs.filter((song) => {
    let ok = true;

    // Recherche plein texte
    const text =
      `${song.titre} ${song.auteur} ${song.recueil} ${song.references} ${song.themes.join(" ")}`.toLowerCase();

    if (q && !text.includes(q)) ok = false;

    // Filtre par thème
    if (selectedTheme && !song.themes.includes(selectedTheme)) ok = false;

    return ok;
  });

  renderTable(filteredSongs);
}
