const mongoose = require('mongoose');
const config = require('./index');

const connectToMongoDB = async () => {
    try {
        if (!config.mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        mongoose.set('strictQuery', false);
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = { connectToMongoDB };
