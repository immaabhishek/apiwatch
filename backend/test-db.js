const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const testConnection = async () => {
  console.log("Testing MongoDB connection to:", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@") : "NO_URI_FOUND");

  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("127.0.0.1") || process.env.MONGO_URI.includes("localhost")) {
    console.log("\n⚠️ MONGO_URI is currently pointing to local MongoDB. Replace it with your MongoDB Atlas cloud URI in .env to connect from Render.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ SUCCESS! MongoDB Atlas cloud database connected successfully!");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections found:", collections.map(c => c.name));
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ FAILED! Could not connect to MongoDB Atlas:");
    console.error(error.message);
    process.exit(1);
  }
};

testConnection();
