require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const distRootPath = path.join(__dirname, 'dist', 'fake-analyzer');
const browserDistPath = path.join(distRootPath, 'browser');
const staticRoot = fs.existsSync(browserDistPath) ? browserDistPath : distRootPath;

app.use(express.json());
app.use(express.static(staticRoot));

app.post('/api/analyze', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const { content } = req.body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Please provide some content to analyze.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is not set. Add it to your environment before running the app.',
      });
    }

    const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

    const prompt = `You are a careful fact-checking assistant. Analyze the following content and estimate how much of it appears fake, misleading, or unverified. Respond with strict JSON in this exact shape: {"fakePercentage": number, "realPercentage": number, "summary": string}\n\nContent:\n${content}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a careful fact-checking assistant. Return only valid JSON with fakePercentage, realPercentage, and summary fields.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    console.log('Groq API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      const errorCode = data?.error?.code;
      if (response.status === 429 || errorCode === 'insufficient_quota') {
        return res.status(429).json({
          error:
            'Your Groq API key has no available quota. Check your Groq billing or quota settings, then try again.',
        });
      }

      return res
        .status(response.status)
        .json({ error: data?.error?.message || 'Groq request failed.' });
    }

    const text = data?.choices?.[0]?.message?.content || '';
    console.log('Groq response received:', text.substring(0, 100));

    res.json({ analysis: text });
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Unknown server error.' });
    }
  } finally {
    clearTimeout(timeout);
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

// Global error handler middleware
app.use((err, _req, res, _next) => {
  console.error('Global error handler:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const server = app.listen(port, () => {
  console.log(`Analyzer server running on http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
