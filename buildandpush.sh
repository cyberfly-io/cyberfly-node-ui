yarn build
docker build . -t cyberfly/cyberfly_node_ui --patform linux/amd64
docker push cyberfly/cyberfly_node_ui