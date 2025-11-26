/* =========================================================
   CONFIGURATION
   ========================================================= */
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3t8tr68VdxmjMamPTnlQQuvpjISPBmAkiDHsZr_vSz5EHk-4Z8JQB58xS-4rAP-72dOi4Mr8FmR9i/pub?output=csv";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfjnD-BKH22nMH_Wq3me611ffIaSnI-BeQEDQ48lbWN0FZo2g/viewform";

const LOGO_FILENAME = "logo.png";

/* =========================================================
   UTILITAIRES
   ========================================================= */

/** Convertit un lien Google Drive en lien direct téléchargeable */
function convertToDirectLink(url) {
  if (!url) return null;
  url = url.trim();

  // Cas "open?id=..."
  const idMatch1 = url.match(/open\?id=([^&]+)/);
  if (idMatch1) return `https://drive.google.com/uc?export=download&id=${idMatch1[1]}`;

  // Cas "file/d/.../"
  const idMatch2 = url.match(/\/file\/d\/([^/]+)/);
  if (idMatch2) return `https://drive.google.com/uc?export=download&id=${idMatch2[1]}`;

  return url; // URL normale
}

/** Crée une bulle (badge) */
function createBadge(label, url, className) {
  const span = document.createElement("span");
  span.className = `badge ${className}`;

  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.textContent = label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    span.appendChild(a);
  } else {
    span.textContent = label;
  }
  return span;
}

/* =========================================================
   CHARGEMENT DU CSV
   ========================================================= */
function loadCSV() {
  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data;
      populateTable(rows);
      populateThemeFilter(rows);
      document.getElementById("status").textContent = "";
    },
    error: () => {
      document.getElementById("status").textContent =
        "Erreur lors du chargement des données.";
    },
  });
}

/* =========================================================
   TABLEAU
   ========================================================= */
function populateTable(rows) {
  const tbody = document.getElementById("songs-body");
  tbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");

    /* ----------- Colonnes simples ----------- */
    const tdTitle = document.createElement("td");
    tdTitle.textContent = row["Titre"] || "";
    tr.appendChild(tdTitle);

    const tdAuthor = document.createElement("td");
    tdAuthor.textContent = row["Auteur"] || "";
    tr.appendChild(tdAuthor);

    const tdCollection = document.createElement("td");
    tdCollection.textContent = row["Recueil"] || "";
    tr.appendChild(tdCollection);

    /* ----------- Thèmes ----------- */
    const tdThemes = document.createElement("td");
    const themesRaw = row["Thèmes"] || "";
    const themes = themesRaw.split(/[,;]+/).map((t) => t.trim()).filter(Boolean);

    themes.forEach((theme) => {
      tdThemes.appendChild(createBadge(theme, null, "badge-theme"));
    });
    tr.appendChild(tdThemes);

    /* ----------- PARTITIONS (fusion PDF) ----------- */
    const tdScores = document.createElement("td");
    ["Partition", "Partition2"].forEach((col) => {
      const link = convertToDirectLink(row[col]);
      if (link) tdScores.appendChild(createBadge("PDF", link, "badge-score"));
    });
    tr.appendChild(tdScores);

    /* ----------- AUDIOS (fusion Mélodie / Alto / Ténor) ----------- */
    const tdAudios = document.createElement("td");
    [
      ["Mélodie", "Mélodie"],
      ["Alto", "Alto"],
      ["Ténor", "Ténor"],
    ].forEach(([col, label]) => {
      const link = convertToDirectLink(row[col]);
      if (link) tdAudios.appendChild(createBadge(label, link, "badge-audio"));
    });
    tr.appendChild(tdAudios);

    /* ----------- Références ----------- */
    const tdRefs = document.createElement("td");
    tdRefs.textContent = row["Références bibliques"] || "";
    tr.appendChild(tdRefs);

    tbody.appendChild(tr);
  });
}

/* =========================================================
   FILTRE PAR THÈME
   ========================================================= */
function populateThemeFilter(rows) {
  const allThemes = new Set();

  rows.forEach((row) => {
    (row["Thèmes"] || "")
      .split(/[,;]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => allThemes.add(t));
  });

  const select = document.getElementById("theme-filter");
  [...allThemes].sort().forEach((theme) => {
    const opt = document.createElement("option");
    opt.value = theme;
    opt.textContent = theme;
    select.appendChild(opt);
  });
}

/* =========================================================
   RECHERCHE + FILTRE
   ========================================================= */
function applyFilters() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const theme = document.getElementById("theme-filter").value;

  const rows = [...document.querySelectorAll("#songs-body tr")];

  rows.forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const matchesQuery = text.includes(query);

    let matchesTheme = true;
    if (theme) {
      const themesCell = tr.children[3];
      matchesTheme = themesCell.textContent.includes(theme);
    }

    tr.style.display = matchesQuery && matchesTheme ? "" : "none";
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Injecter l’URL du bouton "Ajouter un chant"
  document.getElementById("add-song-btn").href = GOOGLE_FORM_URL;

  loadCSV();

  // Recherche
  document.getElementById("search-input").addEventListener("input", applyFilters);

  // Filtre par thèmes
  document.getElementById("theme-filter").addEventListener("change", applyFilters);
});
Partition