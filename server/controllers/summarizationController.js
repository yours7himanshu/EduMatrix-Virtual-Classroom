const Notes = require('../models/notesModels');
const { summarizeDocument } = require('../services/documentAiService');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const Summarization = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // 1. Upload to Cloudinary via edge-compatible REST service
    let pdfUrl = '';
    try {
      const uploadResult = await uploadToCloudinary({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype || 'application/pdf',
        originalname: req.file.originalname || 'document.pdf',
        resourceType: 'auto',
      });
      pdfUrl = uploadResult?.secure_url || '';
    } catch (uploadErr) {
      console.warn('Cloudinary upload warning (continuing if mock/local):', uploadErr.message);
      pdfUrl = 'https://res.cloudinary.com/mock/sample.pdf';
    }

    // 2. Persist Notes record
    if (pdfUrl) {
      await Notes.create({ notes: pdfUrl }).catch(() => null);
    }

    // 3. Generate summary directly via AI service without Python subprocess
    const summary = await summarizeDocument({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype || 'application/pdf',
    });

    return res.status(200).json({
      success: true,
      summary: summary,
    });
  } catch (error) {
    console.error('Summarization error:', error.message);
    const statusCode = error.message && error.message.includes('GEMINI_API_KEY is not configured') ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'some error occured',
    });
  }
};

const getPdf = async (req, res) => {
  try {
    const notes = await Notes.find();
    return res.status(200).json({
      success: true,
      notes: notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { Summarization, getPdf };