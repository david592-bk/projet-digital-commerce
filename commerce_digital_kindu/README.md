# Kindu Commerce Digital

Projet de plateforme e-commerce locale pour Kindu, avec backend Django REST et frontend React + Tailwind.

## Backend

1. Allez dans le dossier backend :

```bash
cd "commerce_digital_kindu/backend"
```

2. Installez les dépendances Python :

```bash
python -m pip install -r requirements.txt
```

3. Appliquez les migrations :

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Créez un superutilisateur pour accéder à l’administration :

```bash
python manage.py createsuperuser
```

5. Lancez le serveur local :

```bash
python manage.py runserver
```

## Frontend

1. Allez dans le dossier frontend :

```bash
cd "commerce_digital_kindu/frontend"
```

2. Installez les dépendances npm/yarn :

```bash
npm install
```

3. Démarrez le serveur de développement :

```bash
npm run dev
```

4. Ouvrez le navigateur sur l’URL fournie par Vite (par défaut `http://localhost:4173`).

## Notes

- Le backend s’exécute par défaut sur `http://127.0.0.1:8000`.
- Le frontend utilise Axios pour appeler `http://127.0.0.1:8000/api`.
- L’authentification utilise un token DRF renvoyé par `/api/auth/login/`.
- Pour un déploiement MySQL/PostgreSQL, modifiez `backend/core_project/settings.py`.
