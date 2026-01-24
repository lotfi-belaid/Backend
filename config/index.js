require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.SECRET_JWT,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7h',
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    nodeEnv: process.env.NODE_ENV || 'development'
};
