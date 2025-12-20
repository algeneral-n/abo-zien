/**
 * RARE 4N - OCR Routes
 * مسارات OCR للمسح الضوئي وتحويل الصور إلى نص
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { extractTextFromImage, scanDocument } from '../services/ocrService.js';
import { getDatabase, DB } from '../database/localDB.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/ocr'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'));
    }
  },
});

/**
 * POST /api/ocr
 * Extract text from image
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.fileId) {
      return res.status(400).json({ error: 'Image file or fileId is required' });
    }

    let imagePath;
    
    // If fileId provided, get file from database
    if (req.body.fileId) {
      const file = DB.files.findById(req.body.fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      imagePath = file.path;
    } else {
      imagePath = req.file.path;
    }

    const language = req.body.language || 'ar';
    const documentType = req.body.documentType || 'general';

    // Extract text
    const extractedText = await extractTextFromImage(imagePath, language);

    // If document type specified, scan as structured document
    let structuredData = null;
    if (documentType !== 'general') {
      structuredData = await scanDocument(imagePath, documentType);
    }

    // Clean up uploaded file if temporary
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      text: extractedText,
      structuredData,
      language,
      documentType,
    });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from image' });
  }
});

/**
 * POST /api/ocr/scan-document
 * Scan document and extract structured data
 */
router.post('/scan-document', upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.fileId) {
      return res.status(400).json({ error: 'Image file or fileId is required' });
    }

    let imagePath;
    
    if (req.body.fileId) {
      const file = DB.files.findById(req.body.fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      imagePath = file.path;
    } else {
      imagePath = req.file.path;
    }

    const documentType = req.body.documentType || 'general';
    const structuredData = await scanDocument(imagePath, documentType);

    // Clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: structuredData,
      documentType,
    });
  } catch (error) {
    console.error('Document scan error:', error);
    res.status(500).json({ error: error.message || 'Failed to scan document' });
  }
});

export default router;
