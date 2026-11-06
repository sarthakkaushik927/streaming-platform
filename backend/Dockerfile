FROM node:22-slim

WORKDIR /app

# Install production dependencies first, so code changes don't reinstall them.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npx --yes pnpm@12.11.2 install --frozen-lockfile --prod

COPY . .

# The app writes log files here, and doesn't need to run as root.
RUN mkdir -p watch-party-logs && chown -R node:node watch-party-logs
USER node

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
