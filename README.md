# Shopkeeper Order Manager

A full-stack application for shopkeepers to manage suppliers, products, and orders efficiently.

## Features

- User registration and login (JWT-based authentication)
- Supplier management (CRUD)
- Product management (CRUD)
- Order creation and management
- PDF generation for orders
- Monthly, top products, and top suppliers statistics

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, Cookie-based
- **PDF Generation:** pdfkit

## Project Structure

```
Backend/
  controllers/
  middleware/
  models/
  routes/
  utils/
  .env
  index.js
  package.json
Frontend/
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/igtaposh/shopkeeper-order-manager.git
   cd shopkeeper-order-manager/Backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the `Backend` folder:
   ```
   MONGO_URI=mongodb://localhost:27017/Shopkeeper-Order-Manager
   JWT_SECRET=your_jwt_secret
   PORT=8080
   ```

4. Start the backend server:
   ```sh
   node index.js
   ```

### API Endpoints

- **Auth:** `/api/auth`
- **Suppliers:** `/api/supplier`
- **Products:** `/api/product`
- **Orders:** `/api/order`

See the `routes/` folder for detailed endpoints.

## License

This project is licensed under the ISC License.
