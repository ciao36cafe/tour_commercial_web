import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const tourEssentialsSchema = new mongoose.Schema({
  dressCode: {
    type: String,
    required: true
  },
  fitness: {
    type: String,
    required: true
  },
  agePolicy: {
    type: String,
    required: true
  },
  prep: {
    type: [String],
    required: true
  }
});

const tourSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: ['morning', 'nightlife', 'cultural', 'local'],
    required: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  tagline: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  groupSize: {
    type: String,
    required: true
  },
  priceSingle: {
    type: Number,
    required: true,
    min: 0
  },
  priceFam: {
    type: Number,
    min: 0
  },
  priceGroup: {
    type: Number,
    required: true,
    min: 0
  },
  groupMin: {
    type: Number,
    required: true,
    min: 1
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    required: true,
    min: 0
  },
  img: {
    type: String,
    required: true
  },
  heroImg: {
    type: String,
    required: true
  },
  galleryImgs: {
    type: [String],
    default: []
  },
  badges: {
    type: [String],
    default: []
  },
  metaDescription: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  highlights: {
    type: [String],
    required: true
  },
  included: {
    type: [String],
    required: true
  },
  notIncluded: {
    type: [String],
    required: true
  },
  itinerary: {
    type: [itineraryItemSchema],
    required: true
  },
  essentials: {
    type: tourEssentialsSchema,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for common queries
tourSchema.index({ category: 1, featured: -1 });
tourSchema.index({ rating: -1 });
tourSchema.index({ name: 'text', description: 'text', tagline: 'text' });

// Static methods
tourSchema.statics.findFeatured = function(limit = 3) {
  return this.find({ featured: true })
    .sort({ rating: -1 })
    .limit(limit);
};

tourSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ category })
    .sort({ rating: -1 })
    .limit(limit);
};

tourSchema.statics.searchTours = function(query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

tourSchema.statics.getCategories = function() {
  return this.distinct('category');
};

tourSchema.statics.getFeaturedWithLimit = function(limit = 3) {
  return this.find({ featured: true })
    .sort({ rating: -1 })
    .limit(limit);
};

// Instance method to get full tour data
tourSchema.methods.getFullTour = function() {
  return this.toObject();
};

const Tour = mongoose.model('Tour', tourSchema, 'tours');

export default Tour;