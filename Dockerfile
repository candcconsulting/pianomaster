# ──────────────────────────────────────────────────────────
# Just Play — Piano Learning App
# Serves the static site via nginx:alpine (tiny image ~23MB)
# ──────────────────────────────────────────────────────────

FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the app
COPY index.html   /usr/share/nginx/html/
COPY player.html  /usr/share/nginx/html/
COPY style.css    /usr/share/nginx/html/
COPY js/          /usr/share/nginx/html/js/
COPY songs/       /usr/share/nginx/html/songs/

EXPOSE 80
