# REST API

Base path: `/api/v1`. Interactive docs are at `/api-docs` on a running server. WebSocket events are listed in the [main README](../README.md#websocket-events).

Routes marked **Auth** need an `Authorization: Bearer <token>` header.

## Auth

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/send-otp` | No | Email a 6-digit signup code, valid for 10 minutes |
| POST | `/auth/signup` | No | Create an account with `username`, `emailAddress`, `password` and `otp` |
| POST | `/auth/login` | No | Returns the user and a JWT valid for 7 days |
| GET | `/auth/me` | Yes | Returns the signed-in user |

## Rooms

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/rooms` | Yes | Create a room with `title` and an optional 11-character `initialVideoId` |
| GET | `/rooms` | Yes | List rooms |
| GET | `/rooms/:roomId` | Yes | Room details and participants |
| GET | `/rooms/:roomId/chat` | Yes | Chat history |
| GET | `/rooms/:roomId/logs` | Yes | Playback history |
| DELETE | `/rooms/:roomId` | Yes | Delete a room (host only) |

## Chatbot

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/chat` | No | Ask the site assistant. Send `message` (up to 4,000 characters) and an optional `history` of up to 20 earlier turns |

## Rate limits

Limits apply per visitor, per minute.

| Routes | Limit |
| --- | --- |
| `/auth/send-otp` | 10 |
| `/chat` | 20 |
| Other `/auth` routes and all `/rooms` routes | 100 |

## Errors

Errors return `{ "success": false, "message": "..." }`.

| Status | Meaning |
| --- | --- |
| 400 | Bad request, or an action the service rejected |
| 401 | Missing or invalid token, or wrong login details |
| 403 | Not allowed, such as a non-host deleting a room |
| 404 | Not found, including malformed room IDs |
| 406 | Failed input validation |
| 429 | Rate limit reached |
