"use strict";

const express = require("express");
const chatbotController = require("../controllers/chatbot-controller");

const router = express.Router();

/**
 * POST /message
 *
 * Receives a farming question and recent chat history.
 * Uses the existing Gemini-powered chatbot controller.
 *
 * Expected request:
 * {
 *   "language": "hi",
 *   "messages": [
 *     {
 *       "role": "user",
 *       "text": "धान की पत्तियां पीली क्यों हो रही हैं?"
 *     }
 *   ]
 * }
 *
 * Successful response:
 * {
 *   "text": "..."
 * }
 */
router.post("/message", chatbotController.sendMessage);

module.exports = router;