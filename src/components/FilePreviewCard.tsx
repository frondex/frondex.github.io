import React from 'react';
import { FileText, Table, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface FileAttachment {
  id: string;
  name: string;
  type: 'csv' | 'markdown' | 'presentation' | 'pdf' | 'image';
  size: number;
  rawContent: string;
  previewContent: any;
  downloadUrl: string;
  metadata?: {
    rows?: number;
    columns?: string[];
    wordCount?: number;
    slideCount?: number;
    characterCount?: number;
  };
}

interface FilePreviewCardProps {
  attachment: FileAttachment;
  onOpenViewer: (attachment: FileAttachment) => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ attachment, onOpenViewer }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    switch (attachment.type) {
      case 'csv':
        return <Table className="h-5 w-5 text-emerald-600" />;
      case 'markdown':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'presentation':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPreviewText = () => {
    if (attachment.type === 'csv' && attachment.metadata?.rows) {
      return `${attachment.metadata.rows} rows, ${attachment.metadata.columns?.length || 0} columns`;
    }
    if (attachment.type === 'markdown' && attachment.metadata?.wordCount) {
      return `${attachment.metadata.wordCount} words`;
    }
    if (attachment.type === 'presentation' && attachment.metadata?.slideCount) {
      return `${attachment.metadata.slideCount} slides`;
    }
    return 'Click to preview';
  };

  const downloadFile = () => {
    const blob = new Blob([attachment.rawContent], { 
      type: attachment.type === 'csv' ? 'text/csv' : 'text/markdown' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-3 border border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getFileIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground truncate">
                {attachment.name}
              </h4>
        <Badge variant="secondary" className="text-xs">
          {attachment.type === 'presentation' ? 'SLIDES' : attachment.type.toUpperCase()}
        </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {formatFileSize(attachment.size)} • {getPreviewText()}
            </p>
            
            {/* Preview snippet for markdown */}
            {attachment.type === 'markdown' && (
              <div className="text-xs text-muted-foreground mb-3 line-clamp-2 bg-muted/30 p-2 rounded">
                {attachment.rawContent.slice(0, 100)}...
              </div>
            )}
            
            {/* CSV table preview */}
            {attachment.type === 'csv' && attachment.previewContent && (
              <div className="mb-3 overflow-hidden">
                <div className="text-xs border rounded bg-background">
                  <div className="p-2 border-b bg-muted/50 font-medium">
                    {attachment.metadata?.columns?.slice(0, 3).join(' • ')}
                    {(attachment.metadata?.columns?.length || 0) > 3 && ' • ...'}
                  </div>
                  <div className="p-2 text-muted-foreground">
                    {attachment.previewContent.slice(0, 2).map((row: any, i: number) => (
                      <div key={i} className="truncate">
                        {Object.values(row).slice(0, 3).join(' • ')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onOpenViewer(attachment)}
              className="h-8 px-3"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={downloadFile}
              className="h-8 px-3"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilePreviewCard;