FROM node:current-alpine3.15

USER $USER_NAME

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN chmod +x /app/setup.sh

ENTRYPOINT /app/setup.sh
