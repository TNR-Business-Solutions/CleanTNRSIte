// Password Utils Tests
const { 
  hashPassword, 
  verifyPassword, 
  validatePasswordStrength 
} = require('../server/handlers/password-utils');

describe('Password Utils', () => {
  const testPassword = 'TestPassword123!';

  describe('hashPassword', () => {
    test('should hash password', async () => {
      const hash = await hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(testPassword);
      expect(hash.startsWith('$2b$')).toBe(true); // bcrypt hash format
    });

    test('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('verifyPassword', () => {
    test('should verify correct password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });

    test('should handle invalid hash format', async () => {
      const isValid = await verifyPassword(testPassword, 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.errors).toHaveLength(0);
    });

    test('should reject short password', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    test('should require uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should require lowercase letter', () => {
      const result = validatePasswordStrength('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should require number', () => {
      const result = validatePasswordStrength('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should require special character', () => {
      const result = validatePasswordStrength('NoSpecial123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    test('should categorize password strength', () => {
      const strong = validatePasswordStrength('StrongPass123!');
      expect(strong.strength).toBe('strong');

      const medium = validatePasswordStrength('MediumPass1');
      expect(medium.strength).toBe('medium');

      const weak = validatePasswordStrength('weak');
      expect(weak.strength).toBe('weak');
    });
  });
});

