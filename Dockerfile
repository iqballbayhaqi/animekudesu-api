# Menggunakan image Node.js versi 20 berbasis Alpine Linux untuk ukuran yang lebih kecil
FROM node:20-alpine

# Mengatur direktori kerja di dalam container
WORKDIR /app

# Menginstal dependensi sistem yang diperlukan untuk build native modules (seperti better-sqlite3)
# python3, make, g++ sering dibutuhkan oleh node-gyp
RUN apk add --no-cache python3 make g++

# Menyalin file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Menginstal dependensi menggunakan yarn (sesuai instruksi user)
# --frozen-lockfile memastikan versi yang diinstal sesuai dengan lockfile
# --production mengheka devDependencies (jika diinginkan untuk production build, tapi nodemon ada di devDependencies
# dan script dev pakai nodemon, jadi kita install semua dulu atau sesuaikan)
# Karena user minta yarn, kita pastikan yarn tersedia (biasanya sudah ada di node image, tapi versi alpine kadang perlu cek)
# Kita install dependencies semua dulu.
RUN yarn install --frozen-lockfile

# Menyalin seluruh kode sumber aplikasi ke dalam container
COPY . .

# Mengekspos port yang digunakan aplikasi (sesuai bin/www atau .env, default 3000)
EXPOSE 3000

# Perintah default untuk menjalankan aplikasi
# User meminta jika perlu running, beri tahu saja. Tapi Dockerfile butuh CMD.
# Kita gunakan command start standard.
CMD ["yarn", "start"]
