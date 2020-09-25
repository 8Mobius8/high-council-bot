FROM node:14

# We'll install a few common requirements here - if you have no native modules, you can safely remove the following RUN command
RUN apt-get update && \
  apt-get install -yqq nginx automake build-essential curl && \
  rm -rf /var/lib/apt/lists/*

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

ARG ENV=production
ENV NODE_ENV $ENV
ENV CI=true

COPY --chown=node:node package.json yarn.loc[k] .npmr[c] ./
RUN yarn install
COPY --chown=node:node . .

CMD ["node"]
