import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileAttachment } from './FilePreviewCard';
import { useToast } from '@/hooks/use-toast';

interface MarkdownViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: FileAttachment;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ isOpen, onClose, attachment }) => {
  const { toast } = useToast();

  const downloadFile = () => {
    const blob = new Blob([attachment.rawContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(attachment.rawContent);
      toast({
        title: "Content copied",
        description: "Markdown content has been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {attachment.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {attachment.metadata?.wordCount} words • Markdown Document
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-none">
            <div className="prose prose-base dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-6 text-foreground border-b border-border pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-medium mb-3 mt-6 text-foreground">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-medium mb-2 mt-4 text-foreground">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-foreground leading-7">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 pl-6 space-y-2 list-disc">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 pl-6 space-y-2 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/30 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-3 py-2 bg-muted font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-3 py-2">
                      {children}
                    </td>
                  ),
                }}
              >
                {attachment.rawContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkdownViewer;