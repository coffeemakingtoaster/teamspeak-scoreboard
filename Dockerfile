FROM node:16 as dev

RUN mkdir -p /home/node/teamspeak-scoreboard
RUN chown -R node:node /home/node/teamspeak-scoreboard
WORKDIR /home/node/teamspeak-scoreboard

EXPOSE 3000

FROM dev as full

#copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

#install dependencies
RUN npm install

#copy source
COPY --chown=node:node . .

USER node

RUN npm run build

CMD ["npm", "run", "start:prod"]