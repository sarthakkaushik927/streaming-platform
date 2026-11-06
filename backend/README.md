# SyncStream Backend

Express API and Socket.IO server for SyncStream. See the [main README](../README.md) for setup, architecture and WebSocket events.

```bash
docker compose up -d   # start PostgreSQL
pnpm install
pnpm dev               # start with nodemon
pnpm start             # start without nodemon
```

## Structure

```
src/
├── config/        Database and Swagger setup
├── controllers/   Request handlers
├── middlewares/   Auth and rate limiting
├── models/        Sequelize models
├── routes/v1/     Express routes
├── services/      Business logic and email
├── utilities/     Logging and password hashing
├── validations/   Joi request schemas
└── websockets/    Socket handlers, Room, RoomManager, Participant
```

## Docs

- [REST API](../docs/API.md)
- [Database](../docs/DATABASE.md)
- [Deployment](../docs/DEPLOYMENT.md)
