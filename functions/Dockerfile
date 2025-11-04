FROM oven/bun:latest

# Install FFmpeg for transcoding and curl for health checks
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

EXPOSE 8080

CMD ["bun", "run", "gateway.js"]

