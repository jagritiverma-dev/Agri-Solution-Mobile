const express = require('express');
const speechController = require('../controllers/speech-controller');

const router = express.Router();

router.post(
  '/transcribe',
  express.raw({ type: 'application/octet-stream', limit: '1mb' }),
  speechController.transcribe
);
router.post('/translate', express.json({ limit: '12kb' }), speechController.translate);

module.exports = router;
