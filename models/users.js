const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  gender: String,   //female, male, non-binary,
  password: String,
  reviews: [mongoose.Schema.Types.ObjectId],
});

userSchema.statics.createUser = async function(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new this({
    username,
    email,
    hashedPassword,
  });
  await user.save();
};

userSchema.statics.getUserByUsername = async function(username) {
  return await this.findOne({ username });
};

userSchema.statics.getUserById = async function(id) {
  return await this.findById(id);
};

const User = mongoose.model("User", userSchema);

module.exports = User;