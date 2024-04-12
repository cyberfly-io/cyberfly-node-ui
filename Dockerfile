FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
# Remove default nginx website
RUN rm -rf ./*
COPY build/ .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
