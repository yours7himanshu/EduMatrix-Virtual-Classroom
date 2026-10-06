const { predictPlacement } = require('../services/documentAiService');

const AiPredictorController = (req, res) => {
  const { marks, attendance, branch } = req.body || {};

  try {
    const prediction = predictPlacement({ marks, attendance, branch });

    return res.status(200).json({
      success: true,
      prediction: {
        result: prediction.result,
        marks: prediction.marks,
        attendance: prediction.attendance,
        branch: prediction.branch,
      },
      message: 'Prediction recieved from the model',
    });
  } catch (error) {
    if (error.message && error.message.includes('valid numeric values')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('AI Predictor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = AiPredictorController;