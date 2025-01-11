FROM node:slim

WORKDIR /usr/src/app

COPY package*.json .

RUN npm i

COPY . ./

ENV GOOGLE_APPLICATION_CREDENTIALS="/usr/src/app/GCP_Service_Account.json"

CMD [ "npm", "start" ]