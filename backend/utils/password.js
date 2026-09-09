const crypto = require('crypto');

// Institutional pepper for deterministic hashing
const PEPPER = process.env.PASSWORD_PEPPER || 'edumanage_institutional_secure_pepper_2026';

/**
 * Hashes a password deterministically using SHA-256 HMAC with PEPPER.
 * Allows instant indexing and strict uniqueness validation across all accounts.
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string.');
  }
  return crypto.createHmac('sha256', PEPPER).update(password.trim()).digest('hex');
}

/**
 * Checks if the given password is already used by ANY user across the entire system.
 * Returns true if the password is unique (unused), false if already taken.
 */
async function isPasswordUnique(password) {
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return false;
  }
  const hash = hashPassword(password);
  const { User } = require('../db/mongodb');
  const existing = await User.findOne({ password_hash: hash });
  return !existing;
}

module.exports = {
  hashPassword,
  isPasswordUnique
};
