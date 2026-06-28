import { describe, expect, it } from 'vitest';
import { AnalyzerService } from './analyzer.service';

describe('AnalyzerService', () => {
  it('formats a prompt and parses analysis JSON output', () => {
    const service = new AnalyzerService();
    const prompt = service.buildPrompt('This is a test article about a notable event.');

    expect(prompt).toContain('fake or misleading');
    expect(prompt).toContain('This is a test article');

    const parsed = service.parseAnalysisResponse(
      '{"fakePercentage": 32, "realPercentage": 68, "summary": "Mostly trustworthy"}',
    );
    expect(parsed.fakePercentage).toBe(32);
    expect(parsed.realPercentage).toBe(68);
    expect(parsed.summary).toContain('trustworthy');
  });

  it('parses fenced JSON from analysis responses', () => {
    const service = new AnalyzerService();
    const parsed = service.parseAnalysisResponse(
      '```json\n{\n  "fakePercentage": 12,\n  "realPercentage": 88,\n  "summary": "Mostly credible"\n}\n```',
    );

    expect(parsed.fakePercentage).toBe(12);
    expect(parsed.realPercentage).toBe(88);
    expect(parsed.summary).toContain('credible');
  });
});
