require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'fake-analyzer')));

app.post('/api/analyze', async (req, res) => {
  try {
    const { content } = req.body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Please provide some content to analyze.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not set. Add it to your environment before running the app.',
      });
    }

    const prompt = `You are a careful fact-checking assistant. Analyze the following content and estimate how much of it appears fake, misleading, or unverified. Respond with strict JSON in this exact shape: {"fakePercentage": number, "realPercentage": number, "summary": string}\n\nContent:\n${content}`;

    console.log('Sending request to Gemini API...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
        apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        // signal: controller.signal,
      },
    );

    clearTimeout(timeout);
    console.log('Gemini API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res
        .status(response.status)
        .json({ error: data?.error?.message || 'Gemini request failed.' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini response received:', text.substring(0, 100));

    res.json({ analysis: text });
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Unknown server error.' });
    }
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'fake-analyzer', 'index.html'));
});

// Global error handler middleware
app.use((err, _req, res, _next) => {
  console.error('Global error handler:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const server = app.listen(port, () => {
  console.log(`Analyzer server running on http://fakeanalyzer:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
