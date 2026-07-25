import mongoose from 'mongoose';

const tourStopSchema = new mongoose.Schema({
  tour_template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourTemplate',
    required: true
  },
  stop_order: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  activities: String,
  notes: String,
  dress_code: String,
  image_url: String,
  address: String,
  default_duration_minutes: Number,
  transport_mode: String,
  distance_from_previous_km: Number,
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
tourStopSchema.index({ tour_template_id: 1, stop_order: 1 });
tourStopSchema.index({ name: 1 });

// Static methods
tourStopSchema.statics.findByTourTemplate = function(tourTemplateId) {
  return this.find({ tour_template_id: tourTemplateId })
    .sort({ stop_order: 1 });
};

tourStopSchema.statics.findByTransportMode = function(mode) {
  return this.find({ transport_mode: mode });
};

// Instance method to get the tour template
tourStopSchema.methods.getTourTemplate = async function() {
  const TourTemplate = mongoose.model('TourTemplate');
  return await TourTemplate.findById(this.tour_template_id);
};

const TourStop = mongoose.model('TourStop', tourStopSchema, 'tourstops');

export default TourStop;