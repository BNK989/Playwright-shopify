FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (or package-lock.json) first for caching purposes
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

RUN pnpm exec playwright install

RUN mkdir -p data

RUN echo '[]' > ./data/siteCodes.json

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]


#docker build -t test_one .
