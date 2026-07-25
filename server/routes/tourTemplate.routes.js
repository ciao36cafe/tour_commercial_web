// routes/tourTemplate.routes.js
import express from 'express';
import { TourTemplate, TourStop } from '../models/index.js';

const router = express.Router();

// Get all tour templates with filtering, search, and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      active, 
      limit = 20, 
      page = 1, 
      search,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by active status
    if (active === 'true') query.is_active = true;
    
    // Filter by category
    if (category && category !== 'all') query.category = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    let templates;
    let total;
    
    // Handle search
    if (search && search.trim()) {
      // Use text search for better results
      const searchResults = await TourTemplate.search(search.trim());
      
      // Apply additional filters to search results
      let filteredResults = searchResults;
      if (query.is_active !== undefined) {
        filteredResults = filteredResults.filter(t => t.is_active === query.is_active);
      }
      if (query.category) {
        filteredResults = filteredResults.filter(t => t.category === query.category);
      }
      
      // Sort filtered results
      filteredResults.sort((a, b) => {
        if (sortBy === 'rating') {
          return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
        }
        return 0;
      });
      
      total = filteredResults.length;
      templates = filteredResults.slice(skip, skip + parseInt(limit));
    } else {
      // Regular query without search
      const [templatesResult, totalResult] = await Promise.all([
        TourTemplate.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort(sort),
        TourTemplate.countDocuments(query)
      ]);
      
      templates = templatesResult;
      total = totalResult;
    }
    
    // Get all unique categories for filter (only from active tours)
    const allCategories = await TourTemplate.distinct('category', { is_active: true });
    
    res.json({
      success: true,
      data: templates,
      categories: allCategories.filter(c => c && c !== ''), // Remove null/empty
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all unique categories
router.get('/categories', async (req, res) => {
  try {
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.is_active = true;
    
    const categories = await TourTemplate.distinct('category', query);
    
    const categoryLabels = {
      morning: 'Morning',
      nightlife: 'Nightlife',
      cultural: 'Cultural',
      local: 'Local Explore'
    };
    
    const result = categories
      .filter(c => c && c !== '')
      .map(cat => ({
        id: cat,
        label: categoryLabels[cat] || cat
      }));
    
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

// Get featured templates
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const templates = await TourTemplate.find({ 
      is_active: true,
      rating: { $gte: 4.0 }
    })
      .sort({ rating: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching featured templates:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get a single template with its stops
router.get('/:id', async (req, res) => {
  try {
    const template = await TourTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Tour template not found'
      });
    }
    
    const stops = await TourStop.find({ tour_template_id: req.params.id })
      .sort({ stop_order: 1 });
    
    res.json({
      success: true,
      data: {
        ...template.toObject(),
        stops
      }
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Search templates with text search
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const results = await TourTemplate.search(query)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TourTemplate.countDocuments({
      $text: { $search: query }
    });
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create a new template
router.post('/', async (req, res) => {
  try {
    const templateData = req.body;
    const template = await TourTemplate.create(templateData);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update a template
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const template = await TourTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Tour template not found'
      });
    }
    
    const updatedTemplate = await TourTemplate.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete a template
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await TourTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Tour template not found'
      });
    }
    
    // Also delete associated stops
    await TourStop.deleteMany({ tour_template_id: id });
    await TourTemplate.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Tour template and associated stops deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;