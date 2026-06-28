export interface AnalysisResult {
  fakePercentage: number;
  realPercentage: number;
  summary: string;
}

export class AnalyzerService {
  buildPrompt(content: string): string {
    return `You are a careful fact-checking assistant. Analyze the following content and estimate how much of it appears fake or misleading. Respond with strict JSON in this exact shape:\n{\"fakePercentage\": number, \"realPercentage\": number, \"summary\": string}\n
Content:\n${content}`;
  }

  parseAnalysisResponse(raw: string): AnalysisResult {
    const cleaned = raw.trim();
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidateSource = fenced?.[1] ?? cleaned;
    const start = candidateSource.indexOf('{');
    const end = candidateSource.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return {
        fakePercentage: 0,
        realPercentage: 0,
        summary: 'The response could not be parsed. Please try again.',
      };
    }

    const candidate = candidateSource.slice(start, end + 1);
    const parsed = JSON.parse(candidate) as Partial<AnalysisResult>;

    return {
      fakePercentage: Number(parsed.fakePercentage ?? 0),
      realPercentage: Number(parsed.realPercentage ?? 0),
      summary: String(parsed.summary ?? 'No summary returned.'),
    };
  }
}
