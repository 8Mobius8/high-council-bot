FROM node:14

WORKDIR /dis-bot

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENTRYPOINT [ "node", "."]