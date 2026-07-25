import mongoose from 'mongoose';

const tourTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  zones: [String],
  default_duration_minutes: Number,
  objectives: String,
  is_active: {
    type: Boolean,
    default: true
  },
  tagline: String,
  category: String,
  badges: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  duration: String,
  start_time: String,
  group_size: String,
  group_min: Number,
  price_single: Number,
  price_group: Number,
  hero_img: String,
  gallery_imgs: [String],
  included: [String],
  not_included: [String],
  highlights: [String],
  dress_code: String,
  fitness: String,
  age_policy: String,
  prep: [String],
  itinerary: [{
    title: String,
    description: String,
    duration: String,
    location: String
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
tourTemplateSchema.index({ name: 'text', description: 'text' });
tourTemplateSchema.index({ category: 1 });
tourTemplateSchema.index({ is_active: 1 });
tourTemplateSchema.index({ rating: -1 });

// Static methods
tourTemplateSchema.statics.findActive = function() {
  return this.find({ is_active: true });
};

tourTemplateSchema.statics.findByCategory = function(category) {
  return this.find({ category, is_active: true });
};

tourTemplateSchema.statics.search = function(query) {
  return this.find(
    { $text: { $search: query }, is_active: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

tourTemplateSchema.statics.findWithStops = async function(templateId) {
  const template = await this.findById(templateId);
  if (!template) return null;
  
  const TourStop = mongoose.model('TourStop');
  const stops = await TourStop.findByTourTemplate(templateId);
  
  return {
    ...template.toObject(),
    stops
  };
};

// Instance method to get all stops
tourTemplateSchema.methods.getStops = async function() {
  const TourStop = mongoose.model('TourStop');
  return await TourStop.findByTourTemplate(this._id);
};

const TourTemplate = mongoose.model('TourTemplate', tourTemplateSchema, 'tourtemplates');

export default TourTemplate;