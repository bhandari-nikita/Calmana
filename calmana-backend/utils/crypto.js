// calmana-backend/utils/crypto.js
const crypto = require("crypto");

// Load raw key from env (must be exactly 32 chars for AES-256)
const KEY_RAW = process.env.ENCRYPTION_KEY;

if (!KEY_RAW) {
  console.warn("ENCRYPTION_KEY not set in env — journal encryption will fail.");
}

// Convert raw string → 32-byte key
const KEY = KEY_RAW ? Buffer.from(KEY_RAW, "utf8") : null;

// AES-256-GCM encrypt
function encryptText(plain) {
  if (!KEY) throw new Error("Encryption key not configured");

  const iv = crypto.randomBytes(12); // recommended IV size for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv, { authTagLength: 16 });

  const encrypted = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    content: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

// AES-256-GCM decrypt
function decryptText({ content, iv, tag }) {
  if (!KEY) throw new Error("Encryption key not configured");
  if (!content || !iv || !tag) return "";

  const encBuf = Buffer.from(content, "base64");
  const ivBuf = Buffer.from(iv, "base64");
  const tagBuf = Buffer.from(tag, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, ivBuf, { authTagLength: 16 });
  decipher.setAuthTag(tagBuf);

  const decrypted = Buffer.concat([decipher.update(encBuf), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encryptText, decryptText };
