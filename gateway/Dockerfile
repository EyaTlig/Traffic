FROM node:20-alpine

WORKDIR /app

# Copier package.json d'abord
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY src/ ./src/

EXPOSE 4000

CMD ["node", "src/index.js"]