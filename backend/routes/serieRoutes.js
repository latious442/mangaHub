const express = require('express');
const { getSerie, postSerie , delSerie} = require('../controllers/serieController');
const upload = require('../helpers/upload');
const AdminMiddleware = require('../middleware/AdminMiddleware');
const router = express.Router();

router.get('/get', getSerie);
router.post('/create', AdminMiddleware, upload.single('photo'), postSerie);
router.delete('/del/:id', AdminMiddleware, delSerie);
module.exports = router;
