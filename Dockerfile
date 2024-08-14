FROM node:22-bullseye

WORKDIR /app

# Copy package.json and pnpm-lock.yaml (or package-lock.json) first for caching purposes
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

RUN pnpm exec playwright install

RUN pnpm exec playwright install-deps

RUN mkdir -p data

RUN echo '[]' > ./data/siteCodes.json

COPY . .

EXPOSE 3000

CMD ["pnpm", "start"]

#docker build -t test_one .