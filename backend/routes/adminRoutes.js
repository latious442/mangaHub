const express = require('express');
const { createAdmin, loginAdmin } = require('../controllers/adminController');
const AdminMiddleware = require('../middleware/AdminMiddleware');
const router = express.Router();
router.post('/create', AdminMiddleware, createAdmin);
router.post('/login', loginAdmin);
module.exports = router;
