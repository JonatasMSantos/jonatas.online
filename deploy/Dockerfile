FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
COPY index.html /usr/share/nginx/html/
COPY styles /usr/share/nginx/html/styles
COPY scripts /usr/share/nginx/html/scripts
COPY assets /usr/share/nginx/html/assets
ENV PORT=8080
EXPOSE 8080
