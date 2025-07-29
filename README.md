# 🛒 Order Sathi - Shopkeeper Order Management System -Backend

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  
</div>

---

**Order Sathi** is a comprehensive full-stack web application designed specifically for shopkeepers to streamline their business operations. It provides an intuitive platform for managing suppliers, products, orders, and generating detailed reports with ease.


## ✨ Key Features

### 🔐 **Authentication & Security**
- **OTP-based Registration/Login** with Twilio integration
- **JWT Authentication** with secure cookie-based sessions
- **Rate Limiting** for OTP requests to prevent spam
- **User Profile Management** with account deletion option

### 👥 **Supplier Management**
- ➕ Add new suppliers with contact details
- 📝 Update supplier information
- 🗑️ Delete suppliers
- 📋 View all suppliers with sorting options

### 📦 **Product Management**
- 🆕 Add products linked to specific suppliers
- 📊 Track product details (weight, rate, MRP, type)
- ✏️ Edit product information
- 🗂️ Categorize products by type
- 🔍 Search and filter products

### 📋 **Order Management**
- 🛒 Create detailed orders with multiple products
- 💰 Automatic calculation of total amount and weight
- 📄 Generate PDF documents for orders (shopkeeper & supplier versions)
- 📈 View order history and details

### 📊 **Stock Reports**
- 📝 Create comprehensive stock reports
- 📄 Generate PDF stock reports
- 📅 Track stock report history
- 📊 View recent stock reports

### 📈 **Analytics & Statistics**
- 📊 Monthly order summaries
- 🏆 Top-selling products analysis
- 🥇 Top suppliers by order volume
- 📅 Recent orders tracking
- 📈 Business insights and trends

## 🛠️ Tech Stack

### **Technologies**
| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) | Runtime Environment | Latest |
| ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat) | Web Framework | ^5.1.0 |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white) | Database | ^8.16.2 |
| ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens) | Authentication | ^9.0.2 |
| ![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=flat&logo=googlechrome&logoColor=white) | PDF Generation | ^24.14.0 |


### **External Services**
- **Twilio** - SMS/OTP services
- **Puppeteer** - PDF generation

## 📁 Project Structure

```
Shopkeeper-Order-Manager/
├── Backend/
│   ├── controllers/           # Business logic controllers
│   │   ├── orderController.js      # Order management
│   │   ├── productController.js    # Product CRUD operations
│   │   ├── StockReportController.js # Stock reporting
│   │   ├── SupplierController.js   # Supplier management
│   │   └── userController.js       # User authentication
│   ├── middleware/           # Custom middleware
│   │   ├── authMiddleware.js       # JWT authentication
│   │   └── rateLimiter.js          # Rate limiting
│   ├── models/              # MongoDB schemas
│   │   ├── Order.js               # Order model
│   │   ├── Otp.js                 # OTP model
│   │   ├── Product.js             # Product model
│   │   ├── Stock.js               # Stock report model
│   │   ├── Supplier.js            # Supplier model
│   │   └── User.js                # User model
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.js          # Authentication routes
│   │   ├── orderRoutes.js         # Order routes
│   │   ├── productRoutes.js       # Product routes
│   │   ├── stockReportRoutes.js   # Stock report routes
│   │   └── SupplierRoutes.js      # Supplier routes
│   ├── utils/               # Utility functions
│   │   └── pdfGenerator.js        # PDF generation logic
│   ├── index.js             # Server entry point
│   └── package.json         # Backend dependencies
```

## 🚀 Getting Started

### 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/igtaposh/ordersathi_backend.git
   cd ordersathi_backend
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
3. **Environment Configuration**
   
   Create a `.env` file in the `Backend` folder:
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

5. **Start the Application**
   
   **Backend Server:**
   ```bash
   cd ordersathi_backend
   npm run dev
   ```
   
   

6. **Access the Application**
   - Backend API: `https://ordersathi.onrender.com`

## 📚 API Documentation

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/send-otp` | Send OTP to phone number | ❌ |
| `POST` | `/verify-otp` | Verify OTP code | ❌ |
| `POST` | `/register` | Register new user | ❌ |
| `POST` | `/login` | User login | ❌ |
| `POST` | `/logout` | User logout | ✅ |
| `GET` | `/user-profile` | Get user profile | ✅ |
| `PUT` | `/update-profile` | Update user profile | ✅ |
| `DELETE` | `/delete-account` | Delete user account | ✅ |

### 👥 Supplier Routes (`/api/supplier`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/add` | Add new supplier | ✅ |
| `GET` | `/` | Get all suppliers | ✅ |
| `GET` | `/:id` | Get single supplier | ✅ |
| `PUT` | `/:id` | Update supplier | ✅ |
| `DELETE` | `/:id` | Delete supplier | ✅ |

### 📦 Product Routes (`/api/product`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/add/:supplierId` | Add product to supplier | ✅ |
| `GET` | `/` | Get all products | ✅ |
| `GET` | `/:id` | Get single product | ✅ |
| `PUT` | `/:id` | Update product | ✅ |
| `DELETE` | `/:id` | Delete product | ✅ |

### 📋 Order Routes (`/api/order`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/new` | Create new order | ✅ |
| `GET` | `/:id` | Get single order | ✅ |
| `GET` | `/:id/pdf` | Download order PDF | ✅ |
| `GET` | `/` | Get recent orders | ✅ |
| `GET` | `/stats/monthly` | Get monthly summary | ✅ |
| `GET` | `/stats/top-products` | Get top products | ✅ |
| `GET` | `/stats/top-suppliers` | Get top suppliers | ✅ |

### 📊 Stock Report Routes (`/api/stock-report`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/new` | Create stock report | ✅ |
| `GET` | `/:id` | Get single stock report | ✅ |
| `GET` | `/:id/pdf` | Download stock report PDF | ✅ |
| `GET` | `/` | Get recent stock reports | ✅ |

## 📱 Usage Guide

### 1. **User Registration**
- Enter your phone number
- Receive and verify OTP
- Complete registration with shop details

### 2. **Managing Suppliers**
- Add suppliers with contact information
- Update supplier details as needed
- View all suppliers in organized list

### 3. **Product Management**
- Add products linked to specific suppliers
- Set pricing (rate, MRP) and product details
- Categorize products by type

### 4. **Creating Orders**
- Select supplier and products
- Specify quantities
- Generate PDF invoices automatically

### 5. **Stock Reports**
- Create detailed stock reports
- Generate professional PDF reports
- Track inventory levels

### 6. **Analytics**
- View monthly business summaries
- Identify top-performing products
- Track supplier performance

## 🔧 Development

### **Running in Development Mode**

```bash
# Backend with auto-reload
cd ordersathi_backend
npm run dev
```

### **Building for Production**

```bash
# Backend (no build required, direct deployment)
cd ordersathi_backend
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**igtaposh**
- GitHub: [@igtaposh](https://github.com/igtaposh)

## 🙏 Acknowledgments

- Thanks to all the open-source libraries that made this project possible
- Special thanks to the Node.js and React communities

---

<div align="center">
  <p>Made with ❤️ for shopkeepers everywhere</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
