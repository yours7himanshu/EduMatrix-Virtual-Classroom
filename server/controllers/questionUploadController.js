const Notes = require('../models/notesModels');
const { generateQuestionsFromDocument } = require('../services/documentAiService');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const UploadPdfFile = async (req, res) => {
  if (!req.file) {
    return res.status(404).json({
      success: false,
      message: 'File not found',
    });
  }

  try {
    // 1. Upload file to Cloudinary via edge-compatible REST service
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

    // 3. Generate questions directly via AI service without Python subprocess
    const questions = await generateQuestionsFromDocument({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype || 'application/pdf',
    });

    return res.status(200).json({
      success: true,
      summary: questions,
    });
  } catch (error) {
    console.error('Question generation error:', error.message);
    const statusCode = error.message && error.message.includes('GEMINI_API_KEY is not configured') ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'some error occured',
    });
  }
};

module.exports = { UploadPdfFile };
