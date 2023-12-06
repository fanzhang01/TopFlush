const mongoose = require("mongoose");
const Restroom = require('./restrooms');

const reviewSchema = new mongoose.Schema({
  restroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restroom',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  const newReview = new Review(reviewData);
  await newReview.save();
  //const { reviewerId, restroomId, ratingMetrics } = reviewData;

  /*
  if (!reviewerId || !restroomId || !ratingMetrics) {
    throw new Error("Required fields are missing");
  }

  //Duplicate Check
  const existingReview = await this.findOne({ reviewerId, restroomId });
  if (existingReview) {
    throw new Error("This user's review for this restroom already exists.");
  }
  */
  //const newReview = new this(reviewData);

  //await newReview.save();

  const avgRatingMetrics = await Restroom.calculateRatingMetrics(
    reviewData.restroomId
  );

    //Update rating of restroom
  if (avgRatingMetrics) {
    await Restroom.findByIdAndUpdate(
      reviewData.restroomId,
      { ratingMetrics: avgRatingMetrics },
      { new: true }
    );
  }
  return newReview;
};

reviewSchema.statics.getReviewByRestroom = async function (restroomId) {
  if (!restroomId) {
    throw new Error("RestroomID is required");
  }

  const reviews = await this.find({ restroomId });
  return reviews;
}

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;