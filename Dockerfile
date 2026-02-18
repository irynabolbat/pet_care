FROM node:18-alpine

WORKDIR /app

RUN npm install -g expo-cli

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 19000 19001 19002 8081

CMD ["npx", "expo", "start", "--dev-client", "--android"]