FROM node:20-alpine

WORKDIR /app

# Copiar manifiesto de dependencias
COPY package.json ./

# Instalar dependencias
RUN npm install --production=false

# Copiar código fuente y pruebas
COPY . .

# Exponer puerto del backend API
EXPOSE 4000

# Comando por defecto para producción / desarrollo
CMD ["npm", "start"]
