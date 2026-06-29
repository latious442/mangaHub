const multer = require('multer');
const path = require('path');

const uploadsRoot = path.join(__dirname, '../public/uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsRoot);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadManga = multer({ storage });
module.exports = uploadManga;
