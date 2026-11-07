# Deployment

The frontend runs on Vercel, the backend runs on Render, and the database runs on Neon. To run the backend on AWS instead, see the [AWS guide](DEPLOYMENT-AWS.md).

Pushing to `main` deploys automatically. Render redeploys the backend on every push, and each Vercel project rebuilds only when its own folder changed.

## Database

Use a Neon PostgreSQL connection URL as `DATABASE_URL`, ideally in the same region as the backend. SyncStream keeps all its tables in its own `syncstream` schema, which it creates on startup, so it can share a database without changing any other tables.

## Backend (Render web service)

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Runtime | Node |
| Build command | `npx --yes pnpm@12.11.2 install --frozen-lockfile` |
| Start command | `node server.js` |
| Health check path | `/api-docs/` |

| Environment variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production`. This switches the server to `DATABASE_URL` and trusts Render's proxy for visitor IPs |
| `NODE_VERSION` | Yes | `22` |
| `DATABASE_URL` | Yes | Neon connection URL. Production connections always use SSL |
| `JWT_SECRET` | Yes | A long random string |
| `CORS_ORIGIN` | Yes | The frontend URL, with no trailing slash |
| `GROQ_API_KEY` | For the chatbot | Without it, `/chat` returns an error |
| `REDIS_URL` | No | Redis connection URL for sharing room broadcasts between instances (Redis Pub/Sub). Use `rediss://` for TLS (Upstash needs it). Without it, the server runs as a single instance |

## Signup email function (Vercel)

Render's free plan may block outgoing email, so requests for signup codes go to a small function on Vercel at `/api/v1/auth/send-otp`. It stores the code in the shared database and emails it, and Render checks the code at signup. It's a separate Vercel project connected to the same repo, with `backend` as its root directory.

| Environment variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | The same Neon URL as the backend |
| `CORS_ORIGIN` | Yes | The frontend URL, with no trailing slash |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Yes | `smtp.gmail.com`, `587` and `false` for Gmail |
| `SMTP_USER`, `SMTP_PASS` | Yes | Gmail address and app password |

Each email address can request a new code every 30 seconds.

## Frontend (Vercel)

A Vercel project connected to the GitHub repo, with `frontend` as its root directory.

| Environment variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `https://<backend>/api/v1` |
| `VITE_WS_URL` | Yes | `https://<backend>` |
| `VITE_OTP_API_BASE_URL` | Yes | `https://<email function>/api/v1` |
| `VITE_YOUTUBE_API_KEY` | For video search | Included in the public site code, so restrict it to your domain in Google Cloud |

Vite reads these at build time, so redeploy after changing them.

## Limits on free plans

- Render's free web services go to sleep when idle, so the first request after a quiet period can take close to a minute. Open the site once before a demo.
- Neon suspends the database when idle, which can add a short delay to the first query afterwards.

## Scaling beyond one server

The backend shares room broadcasts between instances with Redis Pub/Sub (`backend/src/websockets/RedisBroadcaster.js`). Set `REDIS_URL` and playback sync, chat and reactions are published on a Redis channel, so users connected to different instances still get each other's updates. If Redis can't be reached at startup, the server logs it and keeps running as a single instance. Instances that start at the same time take turns setting up the database tables, using a Postgres advisory lock.

To run several instances:

1. Point every instance at the same `REDIS_URL` and `DATABASE_URL`.
2. Put a load balancer in front with sticky sessions (needed for the Socket.IO handshake).
3. Each instance keeps its own PostgreSQL pool of up to 15 connections; keep the total under the database's connection limit.

Live room state (participants and pending requests) is still kept in each instance's memory, so the next step for full multi-instance rooms is to store it in Redis as well.
