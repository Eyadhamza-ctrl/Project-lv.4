const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load models
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Mock data
const categories = [
  {
    name: 'Electronics',
    description: 'Gadgets, devices, smart appliances, laptops, and accessories'
  },
  {
    name: 'Books',
    description: 'Fiction, non-fiction, academic, biographies, and sci-fi books'
  },
  {
    name: 'Clothing',
    description: 'Apparel for men, women, kids, shoes, and seasonal clothing'
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'admin-password123',
    role: 'admin'
  },
  {
    name: 'eyad hamza',
    email: 'eyadhamza251@gmai.com',
    password: 'allah-eyad2009',
    role: 'user'
  }
];

// Helper to import
const importData = async () => {
  try {
    // Clear current database
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    console.log('Database cleared...');

    // Create users & categories
    const createdUsers = await User.create(users);
    const createdCategories = await Category.create(categories);

    const electronicsId = createdCategories.find(cat => cat.name === 'Electronics')._id;
    const booksId = createdCategories.find(cat => cat.name === 'Books')._id;
    const clothingId = createdCategories.find(cat => cat.name === 'Clothing')._id;

    const products = [
      {
        name: 'Smartphone Pro Max',
        price: 999.99,
        category: electronicsId,
        inStock: true
      },
      {
        name: 'Wireless Noise-Cancelling Headphones',
        price: 249.99,
        category: electronicsId,
        inStock: true
      },
      {
        name: 'Introduction to Algorithms',
        price: 89.99,
        category: booksId,
        inStock: true
      },
      {
        name: 'Slim Fit Denim Jeans',
        price: 49.99,
        category: clothingId,
        inStock: true
      },
      {
        name: 'Out of Stock Smartwatch',
        price: 199.99,
        category: electronicsId,
        inStock: false
      }
    ];

    await Product.create(products);

    console.log('Mock data successfully imported to database!');
    process.exit();
  } catch (error) {
    console.error('Error with importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    console.log('Database cleared / destroyed...');
    process.exit();
  } catch (error) {
    console.error(`Error with destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d' || process.argv[2] === '-destroy') {
  destroyData();
} else {
  importData();
}
