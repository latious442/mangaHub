const express = require('express');
const { getManga, createBook , readManga , delManga, showManga} = require('../controllers/mangaController');
const upload = require('../helpers/upload');
const router = express.Router();
const Authmiddleware=require('../middleware/AuthMiddleware');
const AdminMiddleware = require('../middleware/AdminMiddleware');
router.get('/',getManga);
router.get('/show', showManga);
router.post('/', AdminMiddleware, upload.fields([
    { name: 'manga', maxCount: 1 },
    { name: 'image', maxCount: 1 },
]), createBook);
router.get('/read/:id',readManga);
router.delete('/del/:id', AdminMiddleware, delManga);

module.exports = router;
