FROM node
MAINTAINER Leandro Duque Mussio

RUN apt-get update && \
    apt-get install -y vim
RUN npm install -g nodemon forever
RUN mkdir -p /app

WORKDIR /app
ADD . /app

EXPOSE 8080
CMD ["forever","-c","nodemon","server.js"]
