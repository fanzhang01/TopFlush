const mongoose = require("mongoose");

const restroomSchema = new mongoose.Schema({
  location: String,
  capacity: Number,
  reviews: [mongoose.Schema.Types.ObjectId],
  rating: Number,
  pathToImage: String,
  metrics: {
    isOpen: Boolean,
    hasBabyChangingTable: Boolean,
    providesSanitaryProducts: Boolean,
    customerOnly: Boolean,
    dryer: Boolean,
  },
});

module.exports = mongoose.model("Restroom", restroomSchema);
