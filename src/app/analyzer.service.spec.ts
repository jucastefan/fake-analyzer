import { describe, expect, it } from 'vitest';
import { AnalyzerService } from './analyzer.service';

describe('AnalyzerService', () => {
  it('formats a prompt and parses Gemini JSON output', () => {
    const service = new AnalyzerService();
    const prompt = service.buildPrompt('This is a test article about a notable event.');

    expect(prompt).toContain('fake or misleading');
    expect(prompt).toContain('This is a test article');

    const parsed = service.parseGeminiResponse('{"fakePercentage": 32, "realPercentage": 68, "summary": "Mostly trustworthy"}');
    expect(parsed.fakePercentage).toBe(32);
    expect(parsed.realPercentage).toBe(68);
    expect(parsed.summary).toContain('trustworthy');
  });

  it('parses fenced JSON from Gemini responses', () => {
    const service = new AnalyzerService();
    const parsed = service.parseGeminiResponse('```json\n{\n  "fakePercentage": 12,\n  "realPercentage": 88,\n  "summary": "Mostly credible"\n}\n```');

    expect(parsed.fakePercentage).toBe(12);
    expect(parsed.realPercentage).toBe(88);
    expect(parsed.summary).toContain('credible');
  });
});
