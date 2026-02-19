const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  mongoose.set("strictQuery", false);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};

const disconnectFromMongoDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB
};
