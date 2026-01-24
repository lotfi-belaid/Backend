const { validateRequiredFields } = require('./userValidator');

const validateCreateProperty = (req, res, next) => {
    const requiredCheck = validateRequiredFields(req.body, ['name', 'address', 'city', 'postalCode']);
    if (!requiredCheck.valid) {
        return res.status(400).json({ message: requiredCheck.message });
    }
    next();
};

const validateCreateUnit = (req, res, next) => {
    const requiredCheck = validateRequiredFields(req.body, ['propertyId', 'unitNumber', 'rentAmount']);
    if (!requiredCheck.valid) {
        return res.status(400).json({ message: requiredCheck.message });
    }
    next();
};

const validateMongoId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName] || req.body[paramName];
        if (!id) {
            return res.status(400).json({ message: `${paramName} is required` });
        }
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!mongoIdRegex.test(id)) {
            return res.status(400).json({ message: `Invalid ${paramName} format` });
        }
        next();
    };
};

module.exports = {
    validateCreateProperty,
    validateCreateUnit,
    validateMongoId
};
