# MVC E-Commerce API Backend

A fully configured production-ready e-commerce RESTful API backend built using **Node.js**, **Express.js**, and **MongoDB (Mongoose)** following clean **MVC (Model-View-Controller)** design principles.

---

## Features

- **Robust authentication**: Sign up, login, password encryption via `bcryptjs`, and stateless auth sessions using standard JSON Web Tokens (JWT).
- **Categories CRUD**: Hierarchical structuring grouping product pages.
- **Products CRUD**: Extensive catalog indexing with full filtering capability (price limits, text searching), sorting order options, layout pagination, and category populations.
- **Shopping Cart API**: Session status trackers managing item quantities, active pricing totals, additions, and updates.
- **Secure Orders & Checkout**: Processes active cart arrays into persistent invoices, checks item availability, resets transaction carts, and accommodates status changes.
- **Global Error Handling**: Comprehensive pipeline wrapper using `AppError` and custom `asyncHandler` middleware to gracefully manage model validations and server incidents.
- **Auto Data Seed**: DB initializer script to instantly populate mock accounts and items.
- **Postman API Collection**: JSON dataset profile for rapid interface testing.

---

## Project Structure

```text
Project lv.4/
├── config/
│   └── db.js                 # Database Connection configuration
├── controllers/
│   ├── cartController.js     # Shopping cart actions
│   ├── categoryController.js # Category management logic
│   ├── orderController.js    # Order checkout & invoice logs
│   ├── productController.js  # Catalog search & properties
│   └── userController.js     # Authentication registry
├── middleware/
│   ├── asyncHandler.js        # Controller wrapper for exceptions
│   ├── authMiddleware.js      # Protect & role authorization guards
│   └── errorMiddleware.js     # Global HTTP error formatter
├── models/
│   ├── Cart.js               # Cart mongoose schema
│   ├── Category.js           # Category schema
│   ├── Order.js              # Order schema
│   ├── Product.js            # Product catalogue schema
│   └── User.js               # Client credentials schema
├── routes/
│   ├── cartRoutes.js         # /api/carts routing
│   ├── categoryRoutes.js     # /api/categories routing
│   ├── orderRoutes.js        # /api/orders routing
│   ├── productRoutes.js      # /api/products routing
│   └── userRoutes.js         # /api/users routing
├── utils/
│   └── appError.js           # Operational error class
├── .env                      # Application environment configurations
├── .gitignore                # Git exclude rules
├── Ecommerce_API.postman_collection.json # Direct testing collection file
├── package.json              # Script directives and dependencies
├── seeder.js                 # Database initializer populate script
└── server.js                 # Application entry point
```

---

## Getting Started

### 1. Environment Config
Create a file named `.env` in the root folder with the following settings:
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/testdb
JWT_SECRET=your_super_complex_secret_key_12345
JWT_EXPIRE=30d
```

### 2. Install Project Dependencies
Initialize node packages using:
```bash
npm install
```

### 3. Import Seed Data
To purge the database and load mock categories, products, and users (including admin/user accounts):
```bash
npm run data:import
```
To purge all collections without loading mock data:
```bash
npm run data:destroy
```

### 4. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

---

## API Endpoints List

### 🔑 Authentication (`POST`)
- `POST /api/users` - Create a new user token.
- `POST /api/users/login` - Authenticate account and receive token.

### 📁 Categories API
- `GET /api/categories` - Fetch all categories.
- `GET /api/categories/:id` - Fetch single category profile.
- `POST /api/categories` - Create new category (**Admin Only**).
- `PUT /api/categories/:id` - Edit category parameters (**Admin Only**).
- `DELETE /api/categories/:id` - Delete category (**Admin Only**).

### 🏷️ Products API
- `GET /api/products` - Fetch products with optional filtering/pagination parameters.
  - *Example usages*:
    - Search: `?search=Smartphone`
    - Price limit: `?minPrice=100&maxPrice=1000`
    - Sorting: `?sort=-price` (descending order)
    - Pagination: `?page=1&limit=5`
- `GET /api/products/:id` - Fetch single product profile.
- `POST /api/products` - Create new catalogue item (**Admin Only**).
- `PUT /api/products/:id` - Edit specific parameters (**Admin Only**).
- `DELETE /api/products/:id` - Delete item (**Admin Only**).

### 🛒 Shopping Cart API (Protected)
- `GET /api/carts` - Retrieve user shopping cart.
- `POST /api/carts/items` - Add product ID and count to items array.
- `PUT /api/carts/items/:productId` - Change quantity score.
- `DELETE /api/carts/items/:productId` - Pull item from cart.
- `DELETE /api/carts` - Reset cart item array.

### 📦 Orders & Checkout (Protected)
- `POST /api/orders` - Checkout user cart items, save invoice details, and reset cart.
- `GET /api/orders` - Fetch transactions (Common clients see their history, Admin views all).
- `GET /api/orders/:id` - Fetch individual receipt info.
- `PUT /api/orders/:id/status` - Mark transaction status (`status`, `paymentStatus`) (**Admin Only**).

---

## Interactive Postman Testing

1. Open Postman.
2. Select **Import** and upload the `Ecommerce_API.postman_collection.json` file in the root folder.
3. Configure your Postman Environment with:
   - `baseUrl` = `http://localhost:5000`
   - Configure a user `token` and admin `adminToken` environment variables.
4. Run the user or admin login endpoints; standard Postman scripts embedded inside them will automatically capture JWT response parameters and configure active headers.
