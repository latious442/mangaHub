const multer = require('multer');

const storage = multer.memoryStorage();
const uploadManga = multer({ storage });
module.exports = uploadManga;
