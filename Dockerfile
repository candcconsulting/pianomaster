FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the app
COPY index.html        /usr/share/nginx/html/
COPY player.html       /usr/share/nginx/html/
COPY style.css         /usr/share/nginx/html/
COPY abcjs-audio.css   /usr/share/nginx/html/
COPY js/               /usr/share/nginx/html/js/

EXPOSE 80
