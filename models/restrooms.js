const mongoose = require("mongoose");
const Review = require("./reviews");

const restroomSchema = new mongoose.Schema({
  location: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  capacity: {
    type: Number,
    default: null,
  },
  reviews: {
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref:'Review',
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

restroomSchema.statics.calculateAndUpdateRating=async function (restroomId) {
  const Review = require('./reviews');
  const pipeline = [
    { $match: { restroomId: restroomId } },
    {
      $group: {
        _id: "$restroomId",
        avgRating: { $avg: "$rating" },
        avgCleanliness: { $avg: "$ratingMetrics.cleanliness" },
        avgAccessibility: { $avg: "$ratingMetrics.accessibility" },
        avgFacility: { $avg: "$ratingMetrics.facility" },
      },
    },
  ];

  const aggregationResults = await Review.aggregate(pipeline);

  if (aggregationResults.length > 0) {
    const [metrics] = aggregationResults;
    await this.findByIdAndUpdate(restroomId, {
        averageRating: metrics.avgRating,
        ratingMetrics: {
            cleanliness: metrics.avgCleanliness,
            accessibility: metrics.avgAccessibility,
            facility: metrics.avgFacility
        }
    });
  } else {
    return null;
  }
}

const Restroom = mongoose.model("Restroom", restroomSchema);

module.exports = Restroom;
