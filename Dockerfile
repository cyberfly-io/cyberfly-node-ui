FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# Remove default nginx website
RUN rm -rf ./*
COPY build/ .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
