FROM node:latest

# Create app directory
WORKDIR /usr/src/app

COPY package.json .

RUN npm install

RUN npm install -g azure-functions-core-tools@4 typescript --unsafe-perm true

# Bundle app source
COPY . .

RUN npm run prestart

ENTRYPOINT [ "./entrypoint.sh" ]