FROM nginx:latest

# Copiar configuración personalizada con proxy para /api/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar aplicación estática HTML5 / PWA
COPY . /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
