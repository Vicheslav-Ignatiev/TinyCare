FROM node:20-alpine

WORKDIR /app

# Dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# App source
COPY . .

# Vite default port
EXPOSE 5173

# Important for Docker: allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
