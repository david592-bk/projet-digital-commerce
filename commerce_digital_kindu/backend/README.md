# Commerce Digital Kindu — Backend

Documentation rapide pour l'installation, le développement local, les tests et le déploiement (Neon DB / Docker).

## Vue d'ensemble

Backend Django + Django REST Framework exposant :

- Auth JWT (access + refresh) : `/api/auth/` (register, login, refresh, logout, me)
- Shops et Products : `/api/shops/` et endpoints associés

Principaux fichiers :

- `core_project/settings.py` — configuration Django (JWT, CORS, DATABASE_URL)
- `authentication/` — user model, endpoints auth
- `shops/` — boutiques, produits, permissions
- `Dockerfile`, `Procfile`, `requirements.txt`

## Variables d'environnement (exemples)

Mettre ces variables en production (ou dans un `.env`) :

```
DJANGO_SECRET_KEY=change_me_to_a_secure_value
DJANGO_DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/dbname
CORS_ALLOWED_ORIGINS=http://localhost:4173,http://frontend.example.com
```

Notes :

- Par défaut le projet autorise `http://localhost:4173` (port Vite/Front).
- `DATABASE_URL` est utilisé pour Neon / PostgreSQL en production. Si absent, le projet utilise SQLite en dev.

## JWT / Auth

Paramètres importants dans `core_project/settings.py` :

- `SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = 60 minutes`
- `SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = 7 days`
- `ROTATE_REFRESH_TOKENS = True` et `BLACKLIST_AFTER_ROTATION = True`

Endpoints :

- `POST /api/auth/register/` — payload `{ username, email, password }` → crée utilisateur (201)
- `POST /api/auth/login/` — payload `{ username, password }` → renvoie `{ access, refresh, user }`
- `POST /api/auth/refresh/` — payload `{ refresh }` → `{ access, (refresh) }`
- `POST /api/auth/logout/` — header `Authorization: Bearer <access>`, payload `{ refresh }` → blacklist refresh (204)
- `GET /api/auth/me/` — header `Authorization: Bearer <access>` → profil utilisateur

## CORS

- Les origines autorisées sont prises depuis `CORS_ALLOWED_ORIGINS` (séparées par `,`). Par défaut `http://localhost:4173`.

## Exécution locale (dev)

Pré-requis : Python 3.11+, virtualenv

```bash
python -m venv .venv
source .venv/bin/activate     # ou .venv\Scripts\activate sur Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optionnel
python manage.py runserver
```

## Tests

- Tests unitaires API fournis pour `authentication` et `shops` :

```bash
python manage.py test authentication
python manage.py test shops
```

## Docker (build & run)

Le `Dockerfile` inclut les étapes pour installer les dépendances et exécuter migrations + `collectstatic` au démarrage.

Build :

```bash
docker build -t commerce-backend .
```

Run :

```bash
docker run -e DATABASE_URL="$DATABASE_URL" -e DJANGO_SECRET_KEY="$DJANGO_SECRET_KEY" -p 8000:8000 commerce-backend
```

Remarques :

- Pour la production, préférez une plateforme (Railway, Render, Heroku, etc.) et configurez les variables d'environnement via leur interface.
- Vous pouvez ajouter un `docker-compose.yml` si vous souhaitez exécuter des services locaux (Postgres) ensemble.

## Déploiement avec Neon (Postgres)

1. Créer une instance Neon et récupérer la `DATABASE_URL` (connection string).
2. Mettre `DATABASE_URL` dans les variables d'environnement de la plateforme de déploiement.
3. S'assurer que `DJANGO_SECRET_KEY` est défini.
4. Sur la plateforme de déploiement :
   - exécuter `python manage.py migrate` (ou laisser le conteneur le faire au démarrage)
   - exécuter `python manage.py collectstatic --noinput`

### Exemple (Railway / Render / Heroku)

- Définir `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `CORS_ALLOWED_ORIGINS`
- Procfile déjà présent : `web: gunicorn core_project.wsgi:application --bind 0.0.0.0:$PORT`

## Static files

`STATIC_ROOT` est défini dans `core_project/settings.py` (`staticfiles`), `collectstatic` est exécuté dans le `Dockerfile` CMD.

## Entrypoint optionnel

Pour une robustesse accrue, il est conseillé d'ajouter un script `entrypoint.sh` pour :

- attendre la DB (retry loop)
- exécuter `migrate`
- exécuter `collectstatic` (optionnel)
- démarrer Gunicorn

Souhaites-tu que je crée un `entrypoint.sh` et mette à jour le `Dockerfile` pour l'utiliser ?

## API — Shops & Products (détails)

Base paths:

- Shops: `/api/shops/`
- Products: `/api/shops/products/` (global) and `/api/shops/<shop_id>/products/` (by shop)

1. Create shop

- URL: `POST /api/shops/`
- Auth: required
- Payload (JSON):
  ```json
  {
    "name": "Ma Boutique",
    "description": "Description",
    "address": "Adresse",
    "opening_hours": "8h-18h",
    "is_active": true
  }
  ```
- Response: `201` with shop object `{ id, owner, name, description, address, opening_hours, logo, is_active, products }`.

2. List shops

- URL: `GET /api/shops/`
- Auth: optional
- Query: none
- Response: `200` list of shops (only active shops for anonymous users).

3. Retrieve / Update shop

- URL: `GET|PUT|PATCH /api/shops/<pk>/`
- Auth: GET is public, PUT/PATCH require owner or admin
- Payload for update: same fields as creation
- Response: `200` with updated shop or `403` if not permitted.

4. My shop

- URL: `GET /api/shops/me/`
- Auth: required
- Response: `200` merchant profile for the authenticated user or `404` if none.

5. List products (global)

- URL: `GET /api/shops/products/`
- Auth: optional
- Query params:
  - `q`: search term (name, description, shop name)
  - `shop`: filter by shop id (if provided, non-owners see only active shop products)
- Response: `200` list of products.

6. Create product (global)

- URL: `POST /api/shops/products/`
- Auth: required
- Payload (JSON or multipart for images):
  ```json
  {
    "shop": 12, // optional if creating under shop-specific endpoint
    "name": "Produit",
    "item_type": "product",
    "category": "autre",
    "description": "...",
    "price": "1500.00",
    "currency": "XAF",
    "stock": 10
  }
  ```
- File uploads: include image files as `photos` in multipart/form-data; images are saved to `product_photos/`.
- Permissions: only shop owner or admin can create a product for a shop.
- Response: `201` created product object.

7. List / Create products for a shop

- URL: `GET|POST /api/shops/<shop_id>/products/`
- Auth: GET public (active shops), POST requires shop owner or admin
- Use POST without `shop` field (it's taken from URL).

8. Product detail / update / delete

- URL: `GET|PUT|PATCH|DELETE /api/shops/products/<pk>/`
- Auth: GET public (active shops), write methods require shop owner or admin
- Response codes: `200` for read/update, `204` for delete, `403` for forbidden.

9. Delete product image

- URL: `DELETE /api/shops/products/images/<pk>/`
- Auth: required (owner or admin)
- Response: `204` on success.

Notes:

- Permissions are enforced using `IsAuthenticatedOrReadOnly` and `IsShopOwnerOrAdmin`.
- For endpoints that accept file uploads, use `multipart/form-data` and the field name `photos` for multiple images.
- Search and filtering are available on the product list via query params.

Examples (curl):

Create a shop:

```bash
curl -X POST http://localhost:8000/api/shops/ \
   -H "Authorization: Bearer <ACCESS>" \
   -H "Content-Type: application/json" \
   -d '{"name":"Ma Boutique","address":"1 Rue"}'
```

Create a product with image (shop-specific):

```bash
curl -X POST http://localhost:8000/api/shops/12/products/ \
   -H "Authorization: Bearer <ACCESS>" \
   -F "name=Produit Test" \
   -F "price=1500.00" \
   -F "photos=@./photo1.jpg" \
   -F "photos=@./photo2.jpg"
```

---

Fin de la documentation API Shops/Products.
