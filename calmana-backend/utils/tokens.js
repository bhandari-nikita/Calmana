// utils/tokens.js
const crypto = require('crypto');

function genTokenPlain(len = 32) {
  return crypto.randomBytes(len).toString('hex'); // plain token (sent in email)
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { genTokenPlain, hashToken };
