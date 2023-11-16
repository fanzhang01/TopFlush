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
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    default: [],
  },
  rating: {
    type: Number,
    default: null,
  },
  ratingMetrics: {
    cleanliness: {
      type: Number,
      default: null,
    },
    accessibility: {
      type: Number,
      default: null,
    },
    facility: {
      type: Number,
      default: null,
    },
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

async function calculateRatingMetrics(restroomId) {
  const pipeline = [
    { $match: { restroomId: mongoose.Types.ObjectId(restroomId) } },
    {
      $group: {
        _id: "$restroomId",
        avgCleanliness: { $avg: "$ratingMetrics.cleanliness" },
        avgAccessibility: { $avg: "$ratingMetrics.accessibility" },
        avgFacility: { $avg: "$ratingMetrics.facility" },
      },
    },
  ];

  const results = await Review.aggregate(pipeline);

  if (results.length > 0) {
    return {
      cleanliness: results[0].avgCleanliness,
      accessibility: results[0].avgAccessibility,
      facility: results[0].avgFacility,
    };
  } else {
    return null;
  }
}

const Restroom = mongoose.model("Restroom", restroomSchema);

module.exports = Restroom;
