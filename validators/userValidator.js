const { PASSWORD_REGEX, PASSWORD_MESSAGE } = require('../utils/constants');

const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }
    if (!PASSWORD_REGEX.test(password)) {
        return { valid: false, message: PASSWORD_MESSAGE };
    }
    return { valid: true };
};

const validateEmail = (email) => {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    return { valid: true };
};

const validateRequiredFields = (body, fields) => {
    const missing = fields.filter(field => !body[field]);
    if (missing.length > 0) {
        return {
            valid: false,
            message: `Missing required fields: ${missing.join(', ')}`
        };
    }
    return { valid: true };
};

const validateCreateUser = (req, res, next) => {
    const { email, password, name } = req.body;

    const requiredCheck = validateRequiredFields(req.body, ['name', 'email', 'password']);
    if (!requiredCheck.valid) {
        return res.status(400).json({ message: requiredCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
        return res.status(400).json({ message: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        return res.status(400).json({ message: passwordCheck.message });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    const requiredCheck = validateRequiredFields(req.body, ['email', 'password']);
    if (!requiredCheck.valid) {
        return res.status(400).json({ message: requiredCheck.message });
    }

    next();
};

module.exports = {
    validatePassword,
    validateEmail,
    validateRequiredFields,
    validateCreateUser,
    validateLogin
};
