# vico-contac-apps

Aplikasi sederhana untuk CRUD contacts

Aplikasi Contact Management sederhana untuk mengelola daftar kontak dengan fitur CRUD lengkap, built dengan Angular 21 (Frontend) dan NestJS + MongoDB (Backend).

## Fitur Utama

✅ CRUD Lengkap - Create, Read, Update, Delete kontak
✅ Validasi Form - Validasi real-time untuk nama, email, dan telepon
✅ Pencarian - Cari kontak berdasarkan nama atau nomor telepon
✅ Pagination - Navigasi halaman yang user-friendly
✅ UI Responsif - Tampilan optimal di desktop dan mobile
✅ Database MongoDB - Penyimpanan data yang scalable
✅ REST API - API endpoints yang lengkap

## Cara Menjalankan Aplikasi

Prerequisites

- Node.js 18+ dan npm
- MongoDB Community Edition
- Angular CLI 21+
- Git

1. Clone Repo
   git clone https://github.com/anieswahdie1/vico-contact-app.git
   cd vico-contact-app

2. Setup Backend
   cd contact-api

npm install

# Konfiguransi .env dengan data sbb:

```env
MONGODB_URI=mongodb://localhost:27017/contact_app
PORT=3000
NODE_ENV=development
```

## jalankan MongoDB

# Untuk macOS (Homebrew)

brew services start mongodb-community

# Untuk Linux (Ubuntu/Debian)

sudo systemctl start mongod

# Untuk Windows

# Jalankan MongoDB Compass atau MongoDB sebagai service

# Development mode (auto-reload)

npm run start:dev

# Atau production mode

npm run start:prod

3. Setup Frontend

# Masuk ke folder fe

cd contact-ui

# Install Dependencies

npm install

# Install Tailwind CSS:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Edit tailwind.config.js

/** @type {import('tailwindcss').Config} \*/
module.exports = {
content: [
"./src/**/\*.{html,ts}",
],
theme: {
extend: {},
},
plugins: [],
}

## Jalankan Frontend

ng serve

Frontend akan berjalan di: http://localhost:4200

## Daftar Endpoint API

Base URL: http://localhost:3000

1. Get All Contacts

   - Method: GET
   - URL: /contacts
   - Response:
     {
     "success": true,
     "message": "Daftar kontak berhasil diambil",
     "data": {}
     }

2. Get Contact By ID

   - Method: GET
   - URL: /contacts/:id
   - Parameters: id (ObjectId MongoDB)
   - Response:
     {
     "success": true,
     "message": "Kontak berhasil ditemukan",
     "data": {}
     }

3. Create Contact

- Method: POST
- URL: /contacts
- Body:
  {
  "name": "Amien Ridlo",
  "email": "ridlo@gmail.com",
  "phone": "0896673508360"
  }

4. Update Contact

- Method: PATCH
- URL: /contacts/:id
- Body:
  {
  "name": "Amien Ridlo Edit",
  "email": "ridlo-edit@gmail.com",
  "phone": "0896673508360"
  }

5. Delete Contact

- Method: DELETE
- URL: /contacts/:id
- Parameters: id (ObjectId MongoDB)
- Response:
  {
  "success": true,
  "message": "Kontak berhasil dihapus",
  "data": null
  }

6. Search Contact

- Method: GET
- URL: /contacts/search?q=ridlo
- Query Parameters: q (search query)
- Response:
  {
  "success": true,
  "message": "Hasil pencarian berhasil diambil",
  "data": [
  {
  "_id": "6931e2b74471a31f8e5d9aad",
  "name": "Amien Ridlo",
  "phone": "0896673508360",
  "email": "ridlo@gmail.com",
  "createdAt": "2025-12-04T19:36:23.639Z",
  "updatedAt": "2025-12-04T19:36:23.639Z",
  "__v": 0
  }
  ]
  }

## Cara Jalankan Unit Test

cd contact-api

npm test

atau

jalankan dengan watch mode
npm run test:watch
