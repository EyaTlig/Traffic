# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Utiliser npm install au lieu de npm ci (car pas de package-lock.json)
RUN npm install

# Copier le reste du code source
COPY . .

# Build l'application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copier le build
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]