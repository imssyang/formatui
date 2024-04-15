FROM node:hydrogen-buster-slim

WORKDIR /opt/formatui

COPY README.md package.json rollup.config.js .
COPY src/ src/
RUN npm install && npm run build

CMD ["bash"]
