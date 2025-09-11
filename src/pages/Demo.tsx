import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Table, Presentation, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CSVViewer from '@/components/CSVViewer';
import MarkdownViewer from '@/components/MarkdownViewer';
import { PresentationViewer } from '@/components/PresentationViewer';
import { FileAttachment } from '@/components/FilePreviewCard';

const Demo = () => {
  const navigate = useNavigate();
  const [csvViewerOpen, setCsvViewerOpen] = useState(false);
  const [markdownViewerOpen, setMarkdownViewerOpen] = useState(false);
  const [presentationViewerOpen, setPresentationViewerOpen] = useState(false);

  // Sample CSV data
  const csvSample: FileAttachment = {
    id: 'demo-csv',
    name: 'sample-data.csv',
    type: 'csv',
    size: 2048,
    rawContent: `Company,Revenue,Employees,Founded,Industry
Apple Inc,394328000000,164000,1976,Technology
Microsoft,198270000000,221000,1975,Technology
Amazon,513983000000,1540000,1994,E-commerce
Google,282836000000,174014,1998,Technology
Meta,117929000000,86482,2004,Social Media
Tesla,96773000000,127855,2003,Automotive
Netflix,31616000000,12800,1997,Entertainment
Spotify,13245000000,9000,2006,Entertainment
Airbnb,8399000000,6407,2008,Travel
Uber,31877000000,29300,2009,Transportation`,
    previewContent: 'Sample financial data',
    downloadUrl: '',
    metadata: {
      rows: 10,
      columns: ['Company', 'Revenue', 'Employees', 'Founded', 'Industry'],
      characterCount: 500
    }
  };

  // Sample Markdown data
  const markdownSample: FileAttachment = {
    id: 'demo-markdown',
    name: 'financial-report.md',
    type: 'markdown',
    size: 3072,
    rawContent: `# Q4 2024 Financial Analysis Report

## Executive Summary

Our comprehensive analysis of the technology sector reveals **strong growth** across multiple verticals, with particular strength in:

- Cloud computing services (+28% YoY)
- Artificial Intelligence platforms (+45% YoY)
- Cybersecurity solutions (+22% YoY)

### Key Findings

#### Market Performance
The technology sector outperformed the broader market by **12.3 percentage points** during Q4 2024.

#### Top Performers
1. **AI/ML Companies**: Average return of 34%
2. **Cloud Infrastructure**: Average return of 28%
3. **Fintech Solutions**: Average return of 19%

### Investment Recommendations

#### BUY Ratings
- Companies with strong AI capabilities
- Cloud-first infrastructure providers
- Cybersecurity leaders

#### HOLD Ratings
- Traditional software companies transitioning to SaaS
- Hardware manufacturers with supply chain risks

#### Risk Factors
> ⚠️ **Warning**: Regulatory changes in AI governance could impact valuations

### Financial Projections

| Metric | Q1 2025E | Q2 2025E | Q3 2025E | Q4 2025E |
|--------|----------|----------|----------|----------|
| Revenue Growth | 15.2% | 17.8% | 19.1% | 16.5% |
| EBITDA Margin | 32.1% | 33.4% | 34.2% | 33.8% |
| FCF Yield | 8.9% | 9.2% | 9.8% | 9.5% |

### Conclusion

The technology sector presents **compelling investment opportunities** for 2025, driven by continued innovation in AI, cloud computing, and digital transformation initiatives.

---

*This report was prepared by the Financial Analysis Team*
*Last updated: December 2024*`,
    previewContent: 'Financial analysis document',
    downloadUrl: '',
    metadata: {
      wordCount: 245,
      characterCount: 1500
    }
  };

  // Sample Presentation data
  const presentationSample: FileAttachment = {
    id: 'demo-presentation',
    name: 'market-overview.html',
    type: 'presentation',
    size: 4096,
    rawContent: `<section>
<h1>2024 Market Overview</h1>
<h2>Investment Opportunities in Technology</h2>
<p><strong>Prepared by:</strong> Financial Research Team</p>
<p><strong>Date:</strong> December 2024</p>
</section>

<section>
<h2>Agenda</h2>
<ul>
<li>Market Performance Review</li>
<li>Sector Analysis</li>
<li>Key Investment Themes</li>
<li>Risk Assessment</li>
<li>2025 Outlook</li>
</ul>
</section>

<section>
<h2>Market Performance</h2>
<h3>Year-to-Date Returns</h3>
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 20px 0;">
<h4>Technology Sector: +24.8%</h4>
<h4>S&P 500: +12.5%</h4>
<h4>Outperformance: +12.3%</h4>
</div>
</section>

<section>
<h2>Top Growth Drivers</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
<h4>🤖 Artificial Intelligence</h4>
<p><strong>+45% Growth</strong></p>
<p>Machine learning, automation, and AI-powered solutions driving unprecedented demand</p>
</div>
<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
<h4>☁️ Cloud Computing</h4>
<p><strong>+28% Growth</strong></p>
<p>Digital transformation accelerating cloud adoption across industries</p>
</div>
</div>
</section>

<section>
<h2>Investment Thesis</h2>
<blockquote style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; font-style: italic;">
"The convergence of AI, cloud computing, and cybersecurity creates a powerful investment ecosystem with sustainable competitive advantages."
</blockquote>
<h3>Key Metrics Supporting Our Thesis:</h3>
<ul>
<li>📈 Revenue growth acceleration: 15-20% annually</li>
<li>💰 Expanding profit margins: 30%+ EBITDA</li>
<li>🔄 Recurring revenue models: 80%+ subscription-based</li>
</ul>
</section>

<section>
<h2>Risk Factors</h2>
<div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
<h3>⚠️ Key Risks to Monitor</h3>
<ul>
<li><strong>Regulatory Risk:</strong> AI governance and data privacy regulations</li>
<li><strong>Valuation Risk:</strong> High multiples vulnerable to rate changes</li>
<li><strong>Competition Risk:</strong> Rapid innovation cycles and market disruption</li>
<li><strong>Macro Risk:</strong> Economic slowdown impacting enterprise spending</li>
</ul>
</div>
</section>

<section>
<h2>2025 Outlook</h2>
<h3>Our Predictions</h3>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
<div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; text-align: center;">
<h4>📊 Revenue Growth</h4>
<h3 style="color: #155724;">17%</h3>
<p>Expected annual growth</p>
</div>
<div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; text-align: center;">
<h4>💼 M&A Activity</h4>
<h3 style="color: #0c5460;">$450B</h3>
<p>Expected deal volume</p>
</div>
<div style="background: #e2e3e5; border: 1px solid #d6d8db; border-radius: 8px; padding: 15px; text-align: center;">
<h4>🚀 IPO Pipeline</h4>
<h3 style="color: #383d41;">25+</h3>
<p>Major tech IPOs expected</p>
</div>
</div>
</section>

<section>
<h2>Thank You</h2>
<h3>Questions & Discussion</h3>
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; color: white; text-align: center; margin: 30px 0;">
<h4>Contact Information</h4>
<p>📧 research@company.com</p>
<p>📞 +1 (555) 123-4567</p>
<p>🌐 www.company.com/research</p>
</div>
</section>`,
    previewContent: 'Market overview presentation',
    downloadUrl: '',
    metadata: {
      slideCount: 8,
      characterCount: 2500
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">File Viewer Demo</h1>
            <p className="text-muted-foreground">Test the CSV, Markdown, and Presentation viewers</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* CSV Demo */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-emerald-600" />
                CSV Viewer Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">Sample Financial Data</Badge>
              <p className="text-sm text-muted-foreground">
                View a sample CSV with company financial data including revenue, employees, and industry information.
              </p>
              <div className="bg-muted/30 p-3 rounded text-xs font-mono">
                Company,Revenue,Employees...<br/>
                Apple Inc,394328000000,164000...<br/>
                Microsoft,198270000000,221000...
              </div>
              <Button 
                onClick={() => setCsvViewerOpen(true)}
                className="w-full"
              >
                Open CSV Viewer
              </Button>
            </CardContent>
          </Card>

          {/* Markdown Demo */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Markdown Viewer Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">Financial Report</Badge>
              <p className="text-sm text-muted-foreground">
                View a sample financial analysis report with tables, charts, and formatted content.
              </p>
              <div className="bg-muted/30 p-3 rounded text-xs">
                # Q4 2024 Financial Analysis<br/>
                ## Executive Summary<br/>
                Strong growth across multiple verticals...
              </div>
              <Button 
                onClick={() => setMarkdownViewerOpen(true)}
                className="w-full"
              >
                Open Markdown Viewer
              </Button>
            </CardContent>
          </Card>

          {/* Presentation Demo */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-purple-600" />
                Presentation Viewer Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">Market Overview</Badge>
              <p className="text-sm text-muted-foreground">
                View a sample market overview presentation with slides, charts, and interactive navigation.
              </p>
              <div className="bg-muted/30 p-3 rounded text-xs">
                8 slides covering:<br/>
                • Market Performance<br/>
                • Investment Opportunities<br/>
                • Risk Assessment
              </div>
              <Button 
                onClick={() => setPresentationViewerOpen(true)}
                className="w-full"
              >
                Open Presentation Viewer
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Demo Instructions</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>CSV Viewer:</strong> Test sorting, filtering, pagination, and download functionality</p>
              <p><strong>Markdown Viewer:</strong> Test formatted content rendering, copy functionality, and responsive design</p>
              <p><strong>Presentation Viewer:</strong> Test slide navigation, full-screen mode, and auto-play features</p>
            </div>
          </CardContent>
        </Card>

        {/* File Viewers */}
        <CSVViewer
          isOpen={csvViewerOpen}
          onClose={() => setCsvViewerOpen(false)}
          attachment={csvSample}
        />

        <MarkdownViewer
          isOpen={markdownViewerOpen}
          onClose={() => setMarkdownViewerOpen(false)}
          attachment={markdownSample}
        />

        <PresentationViewer
          isOpen={presentationViewerOpen}
          onClose={() => setPresentationViewerOpen(false)}
          attachment={presentationSample}
        />
      </div>
    </div>
  );
};

export default Demo;