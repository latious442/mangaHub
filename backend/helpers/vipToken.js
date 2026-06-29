const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

module.exports = function vipToken(_id, duration = '1h') {
    return jwt.sign({ _id }, secret, { expiresIn: duration });
}