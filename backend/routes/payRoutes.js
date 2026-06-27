const express = require('express');
const { postPay , getPay} = require('../controllers/payController');
const upload = require('../helpers/upload');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const router = express.Router();

router.post('/post', AuthMiddleware, upload.single('pay'), postPay);
router.get('/get',getPay);

module.exports = router;
