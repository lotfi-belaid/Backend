const userValidator = require('./userValidator');
const propertyValidator = require('./propertyValidator');

module.exports = {
    ...userValidator,
    ...propertyValidator
};
