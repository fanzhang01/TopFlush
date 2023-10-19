const mongoose = require("mongoose");

const restroomSchema = new mongoose.Schema({
  location: {
    type: {
      address: String,
      city: String,
      state: String,
    },
    unique: true,
    dropDups: true,
  },
  capacity: {
    type: Number,
    default: null,
  },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  rating: {
    type: Number,
    default: null,
  },
  pathToImage: {
    type: String,
    default: null,
  },
  metrics: {
    isOpen: {
      type: Boolean,
      default: true,
    },
    hasBabyChangingTable: {
      type: Boolean,
      default: false,
    },
    providesSanitaryProducts: {
      type: Boolean,
      default: false,
    },
    customerOnly: {
      type: Boolean,
      default: false,
    },
    dryer: {
      type: Boolean,
      default: false,
    },
  },
});

restroomSchema.statics.getRestroomByLocation = async function (location) {
  const restroom = await this.findOne({ location });
  if (restroom) {
    return restroom._id; // return the ObjectId of the restroom document
  }
  throw new Error("No restroom found at specified location");
};

restroomSchema.statics.addRestroom = async function (restroomData) {
  const { location } = restroomData;

  if (!location) {
    throw new Error("Location is required");
  }

  //Duplicate Check
  const existingRestroom = await this.findOne({ location });
  if (existingRestroom) {
    throw new Error("Restroom already exists at specified location");
  }

  const newRestroom = new this(restroomData);

  await newRestroom.save();

  return newRestroom;
};

const Restroom = mongoose.model("Restroom", restroomSchema);

module.exports = Restroom;
