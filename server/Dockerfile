FROM node:18

WORKDIR /app

RUN git clone https://github.com/bergquist/fake-simple-json-datasource && cd fake-simple-json-datasource && yarn install

WORKDIR /app/fake-simple-json-datasource

CMD ["node","./index.js"]