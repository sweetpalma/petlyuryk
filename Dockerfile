FROM node:14-alpine
WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY tsconfig.json .
COPY public public
COPY src src
CMD ["npm", "start"]
