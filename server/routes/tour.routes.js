import express from 'express';
import { Tour } from '../models/index.js';

const router = express.Router();

// Get all tours with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, limit = 20, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    let tours;
    let total;

    if (search) {
      tours = await Tour.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tagline: { $regex: search, $options: 'i' } }
        ]
      });
      total = tours.length;
    } else {
      const [toursResult, totalResult] = await Promise.all([
        Tour.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ rating: -1 }),
        Tour.countDocuments(query)
      ]);

      tours = toursResult;
      total = totalResult;
    }

    res.json({
      success: true,
      data: tours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get featured tours
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const tours = await Tour.find({ featured: true })
      .sort({ rating: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get tour categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Tour.distinct('category');
    
    const categoryLabels = {
      morning: 'Morning',
      nightlife: 'Nightlife',
      cultural: 'Cultural',
      local: 'Local Explore'
    };

    const result = [
      { id: 'all', label: 'All Tours' },
      ...categories.map(cat => ({
        id: cat,
        label: categoryLabels[cat] || cat
      }))
    ];

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get a single tour by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let tour = await Tour.findById(id);
    
    if (!tour) {
      tour = await Tour.findOne({ id });
    }

    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour not found'
      });
    }

    res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create a new tour
router.post('/', async (req, res) => {
  try {
    const tourData = req.body;
    
    const existingTour = await Tour.findOne({ id: tourData.id });
    if (existingTour) {
      return res.status(400).json({
        success: false,
        error: 'Tour with this ID already exists'
      });
    }

    const tour = await Tour.create(tourData);
    
    res.status(201).json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update a tour
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let tour = await Tour.findById(id);
    if (!tour) {
      tour = await Tour.findOne({ id });
    }
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour not found'
      });
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      tour._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedTour
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete a tour
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let tour = await Tour.findById(id);
    if (!tour) {
      tour = await Tour.findOne({ id });
    }
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour not found'
      });
    }

    await Tour.findByIdAndDelete(tour._id);

    res.json({
      success: true,
      message: 'Tour deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Export as named export
export default router;