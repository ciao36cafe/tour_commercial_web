import express from 'express';
import { TourStop } from '../models/index.js';

const router = express.Router();

// Get all tour stops
router.get('/', async (req, res) => {
  try {
    const { templateId, limit = 100 } = req.query;
    
    const query = {};
    if (templateId) query.tour_template_id = templateId;
    
    const stops = await TourStop.find(query)
      .limit(parseInt(limit))
      .sort({ tour_template_id: 1, stop_order: 1 });
    
    res.json({
      success: true,
      data: stops,
      count: stops.length
    });
  } catch (error) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get stops for a specific template
router.get('/template/:templateId', async (req, res) => {
  try {
    const stops = await TourStop.find({ 
      tour_template_id: req.params.templateId 
    }).sort({ stop_order: 1 });
    
    res.json({
      success: true,
      data: stops
    });
  } catch (error) {
    console.error('Error fetching stops for template:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get a single stop
router.get('/:id', async (req, res) => {
  try {
    const stop = await TourStop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({
        success: false,
        error: 'Tour stop not found'
      });
    }
    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    console.error('Error fetching stop:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;