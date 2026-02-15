FROM node:18-alpine

WORKDIR /app

COPY package.json ./

# Install dependencies using yarn
# Consider adding yarn.lock if it exists, otherwise allow yarn to resolve deps
COPY package* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else yarn install; fi

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
