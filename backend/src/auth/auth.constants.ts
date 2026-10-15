/** Cost factor for bcrypt hashing (2^12 rounds). */
export const BCRYPT_SALT_ROUNDS = 12;

/** bcrypt only uses the first 72 bytes of the input, so longer passwords are rejected. */
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_MIN_LENGTH = 8;

export const JWT_ALGORITHM = 'HS256';
