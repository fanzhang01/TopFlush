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

reviewSchema.statics.addReview = async function (reviewData) {
  const { reviewerId, restroomId, ratingMetrics } = reviewData;

  if (!reviewerId || !restroomId || !ratingMetrics) {
    throw new Error("Required fields are missing");
  }

  //Duplicate Check
  const existingReview = await this.findOne({ reviewerId, restroomId });
  if (existingReview) {
    throw new Error("This user's review for this restroom already exists.");
  }

  const newReview = new this(reviewData);

  await newReview.save();

  return newReview;
};
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;