const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'latioustuturu';

module.exports = function backvipToken(_id, duration = '30s') {
    return jwt.sign({ _id }, secret, { expiresIn: duration });
}