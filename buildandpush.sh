yarn build
docker build . -t cyberfly/cyberfly_node_ui
docker push cyberfly/cyberfly_node_ui