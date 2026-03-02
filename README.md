# Product Management System (Full Stack)

A modern Product Management System built with React, TypeScript, Node.js, and Aiven PostgreSQL.

## Features
- ✨ **CRUD Operations**: Create, Read, Update, and Delete products.
- 🔍 **Search**: Debounced search by product name.
- 📄 **Pagination**: Efficiently browse through large product lists.
- 💎 **Premium UI**: Clean, dark-mode responsive design.
- ☁️ **Cloud Database**: Integrated with Aiven PostgreSQL.

## Prerequisites
- Node.js (v18+)
- An [Aiven.io](https://aiven.io/) account for PostgreSQL.

## Setup Instructions

### 1. Database Setup (Aiven)
1.  Log in to [Aiven Console](https://console.aiven.io/).
2.  Create a new **PostgreSQL** service (Free tier available).
3.  Wait for the service to be "Running".
4.  Find your **Service URI** in the service overview.
5.  Copy the connection string.

### 2. Backend Setup
1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Update the `.env` file with your Aiven `DATABASE_URL`:
    ```env
    DATABASE_URL="your-aiven-connection-string"
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Push the schema to your Aiven database:
    ```bash
    npx prisma db push
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```

### 3. Frontend Setup
1.  Open a new terminal and navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## API Endpoints
- `GET /api/products` - List products (query params: `search`, `page`, `limit`)
- `POST /api/products` - Create a product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
# project
