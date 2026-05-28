# Déploiement du projet Kindu Commerce Digital

## Hébergement recommandé

Option 1 - Docker (plus simple et le plus portable)
1. Depuis `commerce_digital_kindu/` :
   ```bash
   docker compose up --build
   ```
2. Le backend sera disponible sur `http://localhost:8000`
3. Le frontend sera disponible sur `http://localhost:4174`

Option 2 - Plateformes cloud
- Backend : Render, Railway, Fly.io, ou Heroku
- Frontend : Vercel, Netlify ou directement via Docker

## Configuration de l'API frontend

Le frontend utilise `VITE_API_BASE_URL` pour pointer vers l'API Django.
Dans `frontend/.env.example` :
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Si vous déployez frontend + backend séparément, définissez la valeur sur l'URL publique du backend.

## Backend Django

- Fichier principal : `backend/core_project/settings.py`
- Le backend accepte désormais `DJANGO_SECRET_KEY` et `DJANGO_DEBUG`
- Si vous utilisez une base de données distante, définissez `DATABASE_URL`

Exemple :
```env
DJANGO_SECRET_KEY=votre_cle_secrete
DJANGO_DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Commandes utiles

Backend local :
```bash
cd commerce_digital_kindu/backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Frontend local :
```bash
cd commerce_digital_kindu/frontend
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 4174
```

## Hébergement avec Render / Heroku

### Backend
1. Créez un service web Python
2. Déployez depuis le dossier `commerce_digital_kindu/backend`
3. Ajoutez un `Procfile` (déjà présent)
4. Configurez les variables d'environnement :
   - `DJANGO_SECRET_KEY`
   - `DJANGO_DEBUG=False`
   - `DATABASE_URL` si vous utilisez PostgreSQL

### Frontend
1. Créez un site statique ou Docker
2. Déployez depuis `commerce_digital_kindu/frontend`
3. Configurez `VITE_API_BASE_URL`

## Résumé

- `docker-compose.yml` permet un déploiement local complet.
- `frontend/src/api.js` utilise maintenant une URL d’API configurable.
- `backend/settings.py` supporte désormais les variables d’environnement.
