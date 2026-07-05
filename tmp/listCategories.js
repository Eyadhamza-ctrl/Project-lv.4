require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const cats = await Category.find();
  console.log('Categories:', cats);
  process.exit();
})();
