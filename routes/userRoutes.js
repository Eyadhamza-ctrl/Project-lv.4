const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.route('/')
  .get(getUsers)
  .post(createUser);

router.post('/login', loginUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
