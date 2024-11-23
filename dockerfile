FROM node:22-slim

WORKDIR /usr/src/app

COPY package.json .

RUN npm i

COPY . ./

RUN export GOOGLE_APPLICATION_CREDENTIALS="./GCP_Service_Account.json"

CMD [ "npm", "start" ]