const express = require('express');
const { createAdmin, loginAdmin, currentAdmin } = require('../controllers/adminController');
const AdminMiddleware = require('../middleware/AdminMiddleware');
const router = express.Router();
router.post('/create', AdminMiddleware, createAdmin);
router.post('/login', loginAdmin);
router.get('/me', AdminMiddleware, currentAdmin);
module.exports = router;
