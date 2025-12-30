# PHP_Laravel12_Custome_Authentication_Using_Next.JS

Custom customer authentication system built using Laravel 12 as a REST API backend and Next.js as the frontend application. This project demonstrates a complete authentication flow including user registration, login, protected dashboard access, profile retrieval, logout functionality, and JWT-based authentication without using Laravel Breeze or Sanctum.

---

## Overview

This project is designed for beginners and intermediate developers who want to understand how to connect a Laravel API with a modern Next.js frontend using JWT authentication. It follows a clean separation of backend and frontend responsibilities and uses industry-standard practices.

---

## Technology Stack

### Backend (API)

* PHP 8.2 or higher
* Laravel 12
* MySQL Database
* JWT Authentication using tymon/jwt-auth
* RESTful API architecture

### Frontend

* Next.js 14 (App Router)
* React Hooks
* Fetch API for HTTP requests
* LocalStorage and SessionStorage for token handling

---

## Project Structure

PHP_Laravel12_Custome_Authentication_Using_Next.JS/

├── laravel-backend/
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── config/
│   └── .env
│
└── nextjs-frontend/
├── app/
├── components/
├── services/
└── package.json

---

## Features

* Customer registration
* Customer login
* JWT-based authentication
* Protected dashboard route
* User profile API
* Remember me option
* Logout functionality
* Secure API and frontend integration

---

## Requirements

Make sure the following tools are installed:

* PHP 8.2 or higher
* Composer
* MySQL
* Node.js 18 or higher
* npm

Verify versions:

php -v
composer -v
node -v
npm -v

---

## Backend Setup (Laravel 12)

### Step 1: Navigate to Backend Directory

cd laravel-backend

### Step 2: Install Dependencies

composer install

### Step 3: Create Environment File

cp .env.example .env

### Step 4: Configure Database

Update .env file:

APP_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_next_auth
DB_USERNAME=root
DB_PASSWORD=

### Step 5: Generate Application Key

php artisan key:generate

### Step 6: Generate JWT Secret Key

php artisan jwt:secret

### Step 7: Run Database Migrations

php artisan migrate

### Step 8: Start Laravel Development Server

php artisan serve

Backend URL:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## API Endpoints

Method | Endpoint | Description
POST | /api/register | Register new user
POST | /api/login | Login user
GET | /api/profile | Get authenticated user profile
POST | /api/logout | Logout user

All protected routes require Authorization header:

Authorization: Bearer YOUR_JWT_TOKEN

---

## Frontend Setup (Next.js)

### Step 1: Open New Terminal

### Step 2: Navigate to Frontend Directory

cd nextjs-frontend

### Step 3: Install Node Dependencies

npm install

### Step 4: Start Next.js Development Server

npm run dev

Frontend URL:

[http://localhost:3000](http://localhost:3000)

---

## Frontend Application Routes

Route | Description
/register | User registration page
/login | User login page
/dashboard | Protected dashboard page
/login | Redirect if user is not authenticated

---

## Authentication Flow

1. User registers or logs in using the frontend
2. Laravel API validates credentials
3. JWT token is returned in response
4. Token is stored in:

   * localStorage when Remember Me is selected
   * sessionStorage for normal login
5. Token is attached to every protected API request
6. Backend validates token before allowing access

---

## Logout Flow

* JWT token is removed from browser storage
* User session is cleared
* User is redirected to login page

---

## Common Errors and Fixes

### Dashboard Page Not Found

Ensure dashboard file exists:

app/dashboard/page.js

### Unauthorized Error (401)

* Ensure user is logged in
* Verify token exists in storage
* Check Authorization header

### CORS Error

Update config/cors.php:

allowed_origins => ['http://localhost:3000']

Then run:

php artisan config:clear
---
## Screenshot
<img width="1000" height="913" alt="image" src="https://github.com/user-attachments/assets/44350714-6813-43ac-86f8-9591fec46245" />
<img width="850" height="938" alt="image" src="https://github.com/user-attachments/assets/0caf5ef0-5f03-4f52-b947-ec54ebf7d9fa" />
<img width="1889" height="961" alt="image" src="https://github.com/user-attachments/assets/267740b6-050b-4650-8a67-73e4e90fac5a" />




### JWT Errors

Run the following commands:

php artisan jwt:secret
php artisan config:clear

---

## Security Considerations

* Passwords are hashed using Laravel's Hash mechanism
* JWT tokens protect API endpoints
* Sensitive routes are authenticated
* Input validation handled server-side

---

## Future Enhancements

* Cookie-based authentication
* Refresh token implementation
* Role-based access control
* Middleware protection in Next.js
* Deployment documentation

---

## Conclusion

This project provides a clean and practical example of implementing custom authentication using Laravel 12 and Next.js. It is suitable for learning purposes, academic projects, and as a foundation for real-world applications.
