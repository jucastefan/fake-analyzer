import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyzerService, AnalysisResult } from './analyzer.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  protected readonly title = signal('fake-analyzer');
  protected content = '';
  protected isLoading = false;
  protected errorMessage = '';
  protected result: AnalysisResult | null = null;
  protected showSummaryModal = false;

  private readonly analyzer = new AnalyzerService();

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async analyze(): Promise<void> {
    if (!this.content.trim()) {
      this.errorMessage = 'Please enter some content or a URL first.';
      this.result = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.result = null;
    this.showSummaryModal = false;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: this.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed.');
      }

      this.result = this.analyzer.parseGeminiResponse(data.analysis);
      this.showSummaryModal = !!this.result;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unexpected error.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  closeSummaryModal(): void {
    this.showSummaryModal = false;
  }
}
