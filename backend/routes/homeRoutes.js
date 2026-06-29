const express = require('express');
const { getHome, delUser, createUser, loginUser, getCurrentUser, logoutUser } = require('../controllers/homeController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

router.get('/', getHome);
router.get('/me', AuthMiddleware, getCurrentUser);
router.post('/users', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.delete('/del/:id', delUser);
module.exports = router;
