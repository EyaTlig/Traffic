# 🚦 Urban Traffic Platform — Node.js / Express / GraphQL

Plateforme de gestion du trafic urbain — architecture microservices avec API Gateway GraphQL.

## Stack

| Couche | Techno |
|--------|--------|
| Runtime | Node.js 20 |
| Framework | Express |
| API | GraphQL (Apollo Server 3) |
| Auth | JWT (jsonwebtoken) |
| ORM | mysql2 (requêtes SQL directes) |
| DB | MySQL 8 |
| Conteneurs | Docker Compose |

## Démarrage rapide

```bash
git clone <repo>
cd urban-traffic-platform
docker compose up --build
```

Playground GraphQL : **http://localhost:4000/graphql**

## Services

| Service      | Port | Rôle |
|-------------|------|------|
| gateway     | 4000 | Point d'entrée GraphQL unique |
| auth        | 3001 | Inscription, connexion, JWT, rôles |
| vehicle     | 3002 | Véhicules + positions GPS |
| traffic     | 3003 | Zones + densité trafic |
| incident    | 3004 | Déclaration et suivi incidents |
| notification| 3005 | Envoi et lecture notifications |

## Rôles JWT

- **ADMIN** — accès complet
- **OPERATOR** — gestion opérationnelle

## Flux d'utilisation

1. `register` ou `login` → récupère `accessToken`
2. Ajouter `Authorization: Bearer <token>` dans tous les headers
3. Toutes les requêtes passent par le gateway `:4000/graphql`

## Dev local (sans Docker)

```bash
# Lancer MySQL localement sur les ports 3307–3311
# Puis dans chaque dossier :
cd services/auth-service && npm install && npm run dev
cd services/vehicle-service && npm install && npm run dev
# ... etc
cd gateway && npm install && npm run dev
```

## Requêtes de test

Voir `graphql-queries.md`
