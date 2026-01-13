# E-commerce Shopping Cart

A full-stack e-commerce shopping cart application built with Laravel and React, featuring user authentication, product management, shopping cart functionality, and automated notifications.

## 🧱 Tech Stack

- **Backend**: Laravel 12 (latest stable)
- **Frontend**: React (via Laravel Breeze with Inertia.js)
- **Styling**: Tailwind CSS
- **Authentication**: Laravel Sanctum
- **Queue**: Laravel Jobs & Queue
- **Scheduler**: Laravel Task Scheduling
- **Database**: MySQL/SQLite

## 🎯 Features

### Core Features

1. **Authentication**
   - User registration and login
   - Protected routes and API endpoints
   - Session-based authentication

2. **Product Management**
   - Browse products
   - View product details (name, price, stock)
   - Product listing with stock information

3. **Shopping Cart**
   - Add products to cart
   - Update item quantities
   - Remove items from cart
   - View cart total
   - Stock validation before adding/updating
   - Persistent cart tied to authenticated user

4. **Checkout**
   - Simple checkout simulation
   - Decrease product stock on checkout
   - Create orders and order items

### Background Jobs & Queues

1. **Low Stock Notification**
   - Automatically dispatched when product stock falls below threshold (≤ 5)
   - Sends email notification to admin
   - Uses Laravel Queue system

2. **Daily Sales Report**
   - Scheduled job runs daily at 8 PM (UTC)
   - Collects all products sold that day
   - Sends summary email to admin
   - Includes total orders, revenue, and product breakdown

## 📦 Installation

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 20.19 or >= 22.12
- MySQL or SQLite
- NPM or Yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopping-cart
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure Database**
   
   Edit `.env` file and set your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=shopping_cart
   DB_USERNAME=root
   DB_PASSWORD=
   ```

   Or use SQLite (for local development):
   ```env
   DB_CONNECTION=sqlite
   ```

6. **Run Migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed Database**
   ```bash
   php artisan db:seed
   ```

   This will create:
   - Admin user (email: `admin@example.com`, password: `password`)
   - 10 sample products

8. **Configure Queue**

   For local development, you can use the `sync` driver:
   ```env
   QUEUE_CONNECTION=sync
   ```

   For production, use `database` or `redis`:
   ```env
   QUEUE_CONNECTION=database
   ```

   If using database queue, make sure migrations are run (already included in default migrations).

9. **Configure Mail**

   Edit `.env` file with your mail settings. For local testing, you can use Mailtrap or log driver:
   ```env
   MAIL_MAILER=log
   ```

10. **Build Frontend Assets**
    ```bash
    npm run build
    ```

    Or for development:
    ```bash
    npm run dev
    ```

11. **Start Development Server**
    ```bash
    php artisan serve
    ```

    In another terminal (for frontend):
    ```bash
    npm run dev
    ```

## 🚀 Usage

### Running the Application

1. **Start Laravel Server**
   ```bash
   php artisan serve
   ```

2. **Start Frontend Dev Server** (in separate terminal)
   ```bash
   npm run dev
   ```

3. **Start Queue Worker** (if using database queue)
   ```bash
   php artisan queue:work
   ```

4. **Access the Application**
   - Frontend: http://localhost:8000
   - Register a new user or login with admin credentials

### Running Scheduled Tasks

For the daily sales report to work, you need to add Laravel's scheduler to your cron:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or manually test the command:
```bash
php artisan sales:daily-report
```
