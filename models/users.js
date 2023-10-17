const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  gender: String,   //female, male, non-binary,
  password: String,
  reviews: [mongoose.Schema.Types.ObjectId],
});

const User = mongoose.model("User", userSchema);

module.exports = User;