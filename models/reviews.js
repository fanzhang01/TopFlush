const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewerId: mongoose.Schema.Types.ObjectId,
  restroomId: mongoose.Schema.Types.ObjectId,
  text: String,
  rating: Number,
  ratingMetrics: {
    cleanliness: Number,
    accessibility: Number,
    facility: Number,
  },
  metrics: {
    isOpen: Boolean,
    hasBabyChangingTable: Boolean,
    providesSanitaryProducts: Boolean,
    customerOnly: Boolean,
    dryer: Boolean,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;