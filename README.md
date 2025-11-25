# Répertoire des chants — Static web app

Fichiers fournis : `index.html`, `styles.css`, `app.js`, `logo.png` (à placer).

## Configuration
Modifier en haut de `app.js` :
- `SHEET_CSV_URL` — URL CSV publié du Google Sheet (format `output=csv`).
- `GOOGLE_FORM_URL` — lien du Google Form pour l'ajout.
- `LOGO_FILENAME` — nom du fichier logo (par défaut `logo.png`).

## Publier le Google Sheet en CSV
1. Ouvrir votre Google Sheet → Fichier → Publier sur le web → Choisir la feuille → Publier.
2. Copier le lien `output=csv` (ou remplacer `edit` par `export?format=csv` / utiliser le lien fourni par Google). Exemple :
https://docs.google.com/spreadsheets/d/e/…/pub?output=csv

## Déploiement sur Netlify
- Créer un site depuis Git (ou glisser-déposer). Déposer tous les fichiers à la racine.
- Pas de backend nécessaire.

## Notes techniques
- La table utilise `table-layout: fixed` et une hauteur de ligne fixe — aucun retour à la ligne.
- Les colonnes `Partition` et `Audios` affichent des bulles cliquables qui ouvrent dans un nouvel onglet.
- Les `Thèmes` s’affichent en bulles non-cliquables.
- Les liens Google Drive sont convertis automatiquement en liens de téléchargement direct quand possible.
- Accessibilité : alt sur logo, focus visible, navigation clavier possible.

## FAQ / Dépannage
- Si aucune donnée n'apparaît : vérifier que le CSV est public et que `SHEET_CSV_URL` pointe vers le CSV publié.
- Pour ajouter davantage de colonnes : adapter `normalizeRow` dans `app.js`.
________________________________________
Fin des fichiers.
