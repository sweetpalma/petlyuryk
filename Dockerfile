FROM node:14-alpine
WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY tsconfig.json .
COPY src .
CMD ["npm", "start"]
