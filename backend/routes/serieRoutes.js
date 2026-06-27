const express = require('express');
const { getSerie, postSerie , delSerie} = require('../controllers/serieController');
const upload = require('../helpers/upload');
const router = express.Router();

router.get('/get', getSerie);
router.post('/create', upload.single('photo'), postSerie);
router.delete('/del/${id}',delSerie);
module.exports = router;
