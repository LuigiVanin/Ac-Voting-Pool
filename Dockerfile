FROM node

WORKDIR /usr/app

COPY . .

EXPOSE 5000

RUN npm i
RUN npm run build

CMD ["sh", "-c", "npm run db:prod:setup && npm run start:prod"]