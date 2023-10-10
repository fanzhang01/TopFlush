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

restroomSchema.statics.getRestroomByLocation = async function (location) {
  const restroom = await this.findOne({ location });
  if (restroom) {
    return restroom._id; // return the ObjectId of the restroom document
  }
  throw new Error("No restroom found at specified location");
};

module.exports = mongoose.model("Restroom", restroomSchema);
