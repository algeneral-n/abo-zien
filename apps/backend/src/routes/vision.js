/**
 * RARE 4N - Vision Routes
 * مسارات Google Vision API
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  analyzeImage,
  detectImageLabels,
  detectFaces,
  detectLogos,
  checkSafeSearch,
  fullImageAnalysis,
} from '../services/visionService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/vision'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/vision/analyze
 * Full image analysis
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await fullImageAnalysis(req.file.path);
    res.json(result);
  } catch (error) {
    console.error('Vision analyze error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

/**
 * POST /api/vision/labels
 * Detect image labels
 */
router.post('/labels', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await detectImageLabels(req.file.path);
    res.json(result);
  } catch (error) {
    console.error('Vision labels error:', error);
    res.status(500).json({ error: error.message || 'Failed to detect labels' });
  }
});

/**
 * POST /api/vision/faces
 * Detect faces
 */
router.post('/faces', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await detectFaces(req.file.path);
    res.json(result);
  } catch (error) {
    console.error('Vision faces error:', error);
    res.status(500).json({ error: error.message || 'Failed to detect faces' });
  }
});

/**
 * POST /api/vision/logos
 * Detect logos
 */
router.post('/logos', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await detectLogos(req.file.path);
    res.json(result);
  } catch (error) {
    console.error('Vision logos error:', error);
    res.status(500).json({ error: error.message || 'Failed to detect logos' });
  }
});

/**
 * POST /api/vision/safe-search
 * Check safe search
 */
router.post('/safe-search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await checkSafeSearch(req.file.path);
    res.json(result);
  } catch (error) {
    console.error('Vision safe search error:', error);
    res.status(500).json({ error: error.message || 'Failed to check safe search' });
  }
});

export default router;


