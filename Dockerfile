FROM node:18-bullseye

WORKDIR /app

COPY ./ /app

RUN apt update
RUN apt install -y pkg-config libcairo2-dev libpango1.0-dev libpng-dev libjpeg-dev giflib-tools librsvg2-dev libgif-dev \
    libxi-dev build-essential g++ python libgl1-mesa-dev libx11-dev libxkbfile-dev libsecret-1-dev libzmq3-dev libzmq5 \
    cmake ninja-build

RUN npm install

EXPOSE 3000
CMD ["node", "/app/server.js"]
