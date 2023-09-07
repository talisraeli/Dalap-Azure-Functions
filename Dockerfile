FROM node:latest


# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm install

RUN npm install -g azure-functions-core-tools@4 --unsafe-perm true

RUN npm install -g typescript

# RUN npm install -g ts-node

# RUN npm install -g @azure/functions

RUN npm run prestart

ENTRYPOINT [ "./entrypoint.sh" ]