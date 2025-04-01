/**
 * Checks if a value is considered "required" (not null, undefined, or empty string after trimming).
 * @param value - The value to check.
 * @returns True if the value is present, false otherwise.
 */
export const isRequired = (value: any): boolean => {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
        return false;
    }
    // Add checks for other types like empty arrays if needed
    return true;
};

/**
 * Validates an email address format using a regular expression.
 * @param email - The email string to validate.
 * @returns True if the email format is valid, false otherwise.
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    // Basic email regex - adjust complexity as needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength based on minimum length.
 * Add more rules (uppercase, number, symbol) as needed.
 * @param password - The password string to validate.
 * @param minLength - Minimum required length (default: 8).
 * @returns True if the password meets the criteria, false otherwise.
 */
export const isValidPassword = (password: string | null | undefined, minLength: number = 8): boolean => {
    if (!password) return false;
    if (password.length < minLength) {
        return false;
    }
    // Add more complexity checks here if required:
    // const hasUppercase = /[A-Z]/.test(password);
    // const hasLowercase = /[a-z]/.test(password);
    // const hasNumber = /\d/.test(password);
    // const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    // return hasUppercase && hasLowercase && hasNumber && hasSymbol;
    return true;
};

/**
 * Performs a very basic validation for phone number format (e.g., checks for minimum digits).
 * NOTE: Comprehensive phone number validation is complex and region-dependent.
 * Consider using a dedicated library for robust validation if needed.
 * @param phoneNumber - The phone number string to validate.
 * @param minDigits - Minimum required digits (default: 10).
 * @returns True if the format seems plausible, false otherwise.
 */
export const isValidPhoneNumber = (phoneNumber: string | null | undefined, minDigits: number = 10): boolean => {
    if (!phoneNumber) return false;
    // Remove common non-digit characters (+, -, (), space) for digit count
    const digits = phoneNumber.replace(/[+\-()\s]/g, '');
    // Basic check for minimum digit count
    return /^\d+$/.test(digits) && digits.length >= minDigits;
};

/**
 * Checks if two values are equal.
 * @param value1 - First value.
 * @param value2 - Second value.
 * @returns True if values are strictly equal, false otherwise.
 */
export const areEqual = (value1: any, value2: any): boolean => {
    return value1 === value2;
};


// Example Usage (in a form component):
// import { isRequired, isValidEmail } from './utils/validation';
//
// const email = 'test@example.com';
// const password = '';
//
// const isEmailValid = isValidEmail(email); // true
// const isPasswordPresent = isRequired(password); // false