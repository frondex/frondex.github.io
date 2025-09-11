import { FileAttachment } from '@/components/FilePreviewCard';

export function parseCSV(csvText: string): { data: any[], columns: string[] } {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return { data: [], columns: [] };
  
  // Parse CSV with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };
  
  const columns = parseCSVLine(lines[0]);
  const data: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    
    columns.forEach((column, index) => {
      row[column] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return { data, columns };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function detectFileInContent(content: string): { type: 'csv' | 'markdown' | null, content: string } {
  // Check for CSV code blocks
  const csvMatch = content.match(/```csv\n([\s\S]*?)\n```/);
  if (csvMatch) {
    return { type: 'csv', content: csvMatch[1] };
  }
  
  // Check for Markdown code blocks
  const markdownMatch = content.match(/```markdown\n([\s\S]*?)\n```/);
  if (markdownMatch) {
    return { type: 'markdown', content: markdownMatch[1] };
  }
  
  // Check for generic code blocks that might be CSV (contains commas and looks tabular)
  const genericMatch = content.match(/```\n([\s\S]*?)\n```/);
  if (genericMatch) {
    const blockContent = genericMatch[1];
    const lines = blockContent.split('\n').filter(line => line.trim());
    
    // Heuristic: if most lines have commas and similar comma counts, it's likely CSV
    if (lines.length > 1) {
      const commaCountsInLines = lines.map(line => (line.match(/,/g) || []).length);
      const avgCommaCount = commaCountsInLines.reduce((sum, count) => sum + count, 0) / commaCountsInLines.length;
      
      if (avgCommaCount > 1 && commaCountsInLines.every(count => Math.abs(count - avgCommaCount) <= 2)) {
        return { type: 'csv', content: blockContent };
      }
    }
  }
  
  return { type: null, content: '' };
}

export function createFileAttachment(
  type: 'csv' | 'markdown',
  content: string,
  filename?: string
): FileAttachment {
  const id = Math.random().toString(36).substr(2, 9);
  const name = filename || `${type === 'csv' ? 'data' : 'document'}.${type}`;
  const size = new Blob([content]).size;
  
  let previewContent: any = null;
  let metadata: any = {};
  
  if (type === 'csv') {
    const { data, columns } = parseCSV(content);
    previewContent = data;
    metadata = {
      rows: data.length,
      columns: columns
    };
  } else if (type === 'markdown') {
    previewContent = content;
    metadata = {
      wordCount: countWords(content)
    };
  }
  
  return {
    id,
    name,
    type,
    size,
    rawContent: content,
    previewContent,
    downloadUrl: URL.createObjectURL(new Blob([content])),
    metadata
  };
}