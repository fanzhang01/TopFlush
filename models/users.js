const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  gender: String,   //female, male, non-binary,
  hashedPassword: String,
  reviews: [mongoose.Schema.Types.ObjectId],
});

module.exports = mongoose.model("User", userSchema);