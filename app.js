// Chargement du CSV et initialisation
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const themeFilter = document.getElementById('themeFilter');
const countSpan = document.getElementById('count');
let songs = [];

// Récupération du CSV situé dans le même dossier
fetch('repertoire.csv')
  .then(response => response.text())
  .then(csv => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        songs = results.data;
        initThemeFilter();
        renderTable();
      }
    });
  });

// Mise à jour du filtre thèmes
function initThemeFilter() {
  const themes = new Set();
  songs.forEach(s => {
    if (s.Themes) s.Themes.split(',').forEach(t => themes.add(t.trim()));
  });
  themes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    themeFilter.appendChild(opt);
  });
}

// Recherche + filtrage
searchInput.addEventListener('input', renderTable);
themeFilter.addEventListener('change', renderTable);

function renderTable() {
  const q = searchInput.value.toLowerCase();
  const theme = themeFilter.value;

  const filtered = songs.filter(song => {
    const matchesSearch = Object.values(song).some(v =>
      (v || '').toLowerCase().includes(q)
    );

    const matchesTheme = !theme || (song.Themes && song.Themes.includes(theme));

    return matchesSearch && matchesTheme;
  });

  countSpan.textContent = filtered.length;
  tableBody.innerHTML = '';

  filtered.forEach(song => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="title-cell">${song.Titre || ''}</td>
      <td>${song.Auteur || ''}</td>
      <td>${song.Recueil || ''}</td>
      <td>${formatThemes(song.Themes)}</td>
      <td>${formatLinks(song.Partition)}</td>
      <td>${formatAudio(song.Audio)}</td>
      <td>${formatLinks(song.References)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Formatage des thèmes
function formatThemes(list) {
  if (!list) return '';
  return `<div class="badges">${list.split(',').map(t => `<span class="badge theme">${t.trim()}</span>`).join('')}</div>`;
}

// Formatage générique des liens
function formatLinks(list) {
  if (!list) return '';
  return `<div class="badges">${list.split(',').map(l => `<a class="badge link" href="${l.trim()}" target="_blank">Lien</a>`).join('')}</div>`;
}

// Badges pour audios
function formatAudio(list) {
  if (!list) return '';
  return `<div class="badges">${list.split(',').map(l => `<a class="badge audio" href="${l.trim()}" target="_blank">▶︎ Audio</a>`).join('')}</div>`;
}
