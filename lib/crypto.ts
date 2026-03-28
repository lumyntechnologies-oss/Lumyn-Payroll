// lib/crypto.ts - Encryption helpers for sensitive data using Node.js crypto
// For production, consider pgcrypto + Prisma raw queries
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.isBuffer(process.env.ENCRYPTION_KEY) 
  ? process.env.ENCRYPTION_KEY 
  : Buffer.from((process.env.ENCRYPTION_KEY || 'your-32-byte-key!!pad-to32').padEnd(32, '!'), 'utf8');

const ALGORITHM = 'aes-256-gcm';
const AAD = Buffer.from('lumyn-payroll');

// Encrypt string to Buffer
export function encryptField(value: string): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(AAD);
  
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, encrypted]);
}

// Decrypt Buffer to string
export function decryptField(encryptedBuffer: Buffer): string {
  if (encryptedBuffer.length < 28) throw new Error('Invalid encrypted data');
  
  const iv = encryptedBuffer.slice(0, 12);
  const authTag = encryptedBuffer.slice(12, 28);
  const encryptedData = encryptedBuffer.slice(28);
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(AAD);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  
  return decrypted.toString('utf8');
}

// Usage example for Prisma middleware or raw queries
// Update schema to use String? for encrypted fields (store as hex/base64)
// Before save: data.kraPin = encryptField(rawValue).toString('base64')
// After fetch: raw.kraPin = decryptField(Buffer.from(raw.kraPin, 'base64')).toString()

