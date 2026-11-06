# Deployment

The frontend runs on Vercel, the backend runs on Render, and the database runs on Neon.

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
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | For signup | `smtp.gmail.com`, `587` and `false` for Gmail |
| `SMTP_USER`, `SMTP_PASS` | For signup | Gmail address and app password. Without these, signup codes only go to the server log |
| `GROQ_API_KEY` | For the chatbot | Without it, `/chat` returns an error |

## Frontend (Vercel)

Deploy from the `frontend` folder:

```bash
cd frontend
vercel --prod
```

| Environment variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `https://<backend>/api/v1` |
| `VITE_WS_URL` | Yes | `https://<backend>` |
| `VITE_YOUTUBE_API_KEY` | For video search | Included in the public site code, so restrict it to your domain in Google Cloud |

Vite reads these at build time, so redeploy after changing them.

## Limits on free plans

- Render's free web services go to sleep when idle, so the first request after a quiet period can take close to a minute. Open the site once before a demo.
- Render's free plan may block outgoing email ports. If signup emails fail, check the Render logs. The options are a paid instance or an email API.
- Neon suspends the database when idle, which can add a short delay to the first query afterwards.

## Scaling beyond one server

Rooms live in memory on a single server, so this deployment runs one instance. Running several would need the Socket.IO Redis adapter for broadcasts, and shared storage for room state and pending requests.
