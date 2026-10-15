# Dockerfile para PostyLocal (MicroApp 2)
# Sirve la aplicación web móvil 100% estática y autocontenida
FROM nginx:alpine

# Copiar archivos estáticos al directorio web de Nginx
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY app.js /usr/share/nginx/html/app.js

# Exponer puerto estándar
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
