FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the app
COPY index.html        /usr/share/nginx/html/
COPY player.html       /usr/share/nginx/html/
COPY style.css         /usr/share/nginx/html/
COPY abcjs-audio.css   /usr/share/nginx/html/
COPY js/               /usr/share/nginx/html/js/
# If there is a songs/ folder (added upstream), include it so songs can be loaded dynamically
COPY songs/            /usr/share/nginx/html/songs/

EXPOSE 80
