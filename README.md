# 🛒 Order Sathi - Shopkeeper Order Management System - Backend

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</div>

---

**Order Sathi** is a comprehensive full-stack web application designed specifically for shopkeepers to streamline their business operations. The backend now seamlessly supports a modern, professional-grade user interface that features enhanced forms, intuitive iconography, and a corporate look and feel. Behind the scenes, our robust API delivers secure authentication, efficient supplier/product/order management, and detailed reporting features that power a large-scale professional solution.

## ✨ Key Features

### 🔐 **Authentication & Security**

- **OTP-based Registration/Login** integrated via Twilio with enhanced rate limiting for better security
- **JWT Authentication** with secure, cookie-based sessions
- **User Profile & Account Management** capabilities with modern endpoints
- **Robust Security Middleware** to protect API endpoints

### 👥 **Supplier Management**

- ➕ Add new suppliers with detailed contact information
- 📝 Update, sort, and delete supplier records
- 📋 Retrieve organized supplier lists with enhanced filtering

### 📦 **Product Management**

- 🆕 Add and edit products linked to specific suppliers
- 📊 Maintain robust product details (weight, rate, MRP, type) for professional reporting
- 🔍 Advanced product search and categorization via dynamic API endpoints

### 📋 **Order Management**

- 🛒 Create detailed orders that support multiple products in one go
- 💰 Automatic calculation of totals and weights to support professional invoicing
- 📄 Generate PDF invoices with a polished, corporate look for both shopkeepers and suppliers
- 📈 Full order history retrieval with enterprise-level filtering and sorting

### 📊 **Stock Reporting & Analytics**

- 📝 Comprehensive stock report creation with detailed PDF generation
- 📊 Track inventory changes and generate business insights with efficient data aggregation
- 📈 Advanced analytics offering monthly summaries and trend analysis

## 🛠️ Tech Stack

### **Technologies**

| Technology                                                                                               | Purpose             | Version  |
| -------------------------------------------------------------------------------------------------------- | ------------------- | -------- |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)          | Runtime Environment | Latest   |
| ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)                                    | Web Framework       | ^5.1.0   |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)          | Database            | ^8.16.2  |
| ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)                       | Authentication      | ^9.0.2   |
| ![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=flat&logo=googlechrome&logoColor=white) | PDF Generation      | ^24.14.0 |

### **External Services**

- **Twilio** – SMS/OTP services for secure login
- **Puppeteer** – Headless Chrome PDF generation for professional reporting

## 📁 Project Structure

```
Shopkeeper-Order-Manager/
├── ordersathi_backend/
│   ├── controllers/
│   │   ├── orderController.js      # Order management logic
│   │   ├── productController.js    # Product CRUD operations
│   │   ├── StockReportController.js# Stock report processing
│   │   ├── SupplierController.js   # Supplier management functions
│   │   └── userController.js       # User authentication and profile handling
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authentication & route protection
│   │   └── rateLimiter.js          # Enhanced OTP rate limiting
│   ├── models/
│   │   ├── Order.js                # Order schema/model
│   │   ├── Otp.js                  # OTP model
│   │   ├── Product.js              # Product schema/model
│   │   ├── Stock.js                # Stock report model
│   │   ├── Supplier.js             # Supplier model
│   │   └── User.js                 # User schema/model
│   ├── routes/
│   │   ├── authRoutes.js           # Authentication API routes
│   │   ├── orderRoutes.js          # Order endpoints
│   │   ├── productRoutes.js        # Product endpoints
│   │   ├── stockReportRoutes.js    # Stock report endpoints
│   │   └── SupplierRoutes.js       # Supplier endpoints
│   ├── utils/
│   │   └── pdfGenerator.js         # PDF generation logic using Puppeteer
│   ├── index.js                   # Server entry point
│   └── package.json               # Backend dependencies and scripts
```

## 🚀 Getting Started

### 📋 Prerequisites

Before running this backend, ensure you have installed:

- **Node.js** (v14 or higher) – [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) – [Download here](https://www.mongodb.com/try/download/community)
- **Git** – [Download here](https://git-scm.com/)

### ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/igtaposh/ordersathi_backend.git
   cd ordersathi_backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the `ordersathi_backend` folder:

   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/ordersathi

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Twilio Configuration (for OTP)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Start the Backend Server**

   ```bash
   npm run dev
   ```

5. **Access the API**
   - Backend API: `https://ordersathi.onrender.com`

## 📚 API Documentation

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint          | Description                       | Auth Required |
| ------ | ----------------- | --------------------------------- | ------------- |
| POST   | `/send-otp`       | Send OTP to phone number          | ❌            |
| POST   | `/verify-otp`     | Verify OTP code                   | ❌            |
| POST   | `/register`       | Register a new user               | ❌            |
| POST   | `/login`          | User login                        | ❌            |
| POST   | `/logout`         | User logout                       | ✅            |
| GET    | `/user-profile`   | Retrieve user profile information | ✅            |
| PUT    | `/update-profile` | Update user profile               | ✅            |
| DELETE | `/delete-account` | Delete user account               | ✅            |

### 👥 Supplier Routes (`/api/supplier`)

| Method | Endpoint | Description             | Auth Required |
| ------ | -------- | ----------------------- | ------------- |
| POST   | `/add`   | Add a new supplier      | ✅            |
| GET    | `/`      | Get all suppliers       | ✅            |
| GET    | `/:id`   | Get a single supplier   | ✅            |
| PUT    | `/:id`   | Update supplier details | ✅            |
| DELETE | `/:id`   | Delete a supplier       | ✅            |

### 📦 Product Routes (`/api/product`)

| Method | Endpoint           | Description                | Auth Required |
| ------ | ------------------ | -------------------------- | ------------- |
| POST   | `/add/:supplierId` | Add product for a supplier | ✅            |
| GET    | `/`                | Get all products           | ✅            |
| GET    | `/:id`             | Get a single product       | ✅            |
| PUT    | `/:id`             | Update product information | ✅            |
| DELETE | `/:id`             | Delete a product           | ✅            |

### 📋 Order Routes (`/api/order`)

| Method | Endpoint               | Description                                  | Auth Required |
| ------ | ---------------------- | -------------------------------------------- | ------------- |
| POST   | `/new`                 | Create a new order with multiple products    | ✅            |
| GET    | `/:id`                 | Retrieve a single order                      | ✅            |
| GET    | `/:id/pdf`             | Download the order PDF                       | ✅            |
| GET    | `/`                    | Get recent orders                            | ✅            |
| GET    | `/stats/monthly`       | Get monthly order summary                    | ✅            |
| GET    | `/stats/top-products`  | Retrieve top-selling products                | ✅            |
| GET    | `/stats/top-suppliers` | Retrieve top suppliers based on order volume | ✅            |

### 📊 Stock Report Routes (`/api/stock-report`)

| Method | Endpoint   | Description               | Auth Required |
| ------ | ---------- | ------------------------- | ------------- |
| POST   | `/new`     | Create a new stock report | ✅            |
| GET    | `/:id`     | Get a single stock report | ✅            |
| GET    | `/:id/pdf` | Download stock report PDF | ✅            |
| GET    | `/`        | Get recent stock reports  | ✅            |

## 📱 Usage Guide

### 1. **User Registration**

- Enter your phone number for OTP verification.
- Complete registration with a modern, fast setup process.

### 2. **Supplier & Product Management**

- Add, update, or delete supplier data with real-time API support.
- Manage product details including professional-grade attributes (weight, rate, MRP, type).

### 3. **Order & Stock Management**

- Create and manage orders with detailed information to support a polished user interface.
- Generate PDF invoices and stock reports that match a large-scale, professional system.

### 4. **Analytics & Reporting**

- Access monthly summaries, top-seller data, and stock trends for strategic insights tailored for modern enterprises.

## 🔧 Development

### **Running in Development Mode**

```bash
# Start the backend with auto-reload
cd ordersathi_backend
npm run dev
```

### **Building for Production**

```bash
# No build step is required for the backend; deploy the code directly
cd ordersathi_backend
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the **ISC License** – see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**igtaposh**

- GitHub: [@igtaposh](https://github.com/igtaposh)

## 🙏 Acknowledgments

- Special thanks to all open-source libraries and communities that made this project possible.
- Gratitude to the Node.js and Express.js communities for their constant support and innovation.

---

<div align="center">
  <p>Made with ❤️ for shopkeepers everywhere</p>
  <p>⭐ If you find it helpful, please star the repo!</p>
</div>
