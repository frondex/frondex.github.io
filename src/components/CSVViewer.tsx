import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { FileAttachment } from './FilePreviewCard';
import { useToast } from '@/hooks/use-toast';

interface CSVViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: FileAttachment;
}

const CSVViewer: React.FC<CSVViewerProps> = ({ isOpen, onClose, attachment }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Parse CSV data
  const csvData = useMemo(() => {
    if (!attachment.previewContent || !Array.isArray(attachment.previewContent)) {
      return [];
    }
    return attachment.previewContent;
  }, [attachment.previewContent]);

  const columns = useMemo(() => {
    return attachment.metadata?.columns || [];
  }, [attachment.metadata?.columns]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = csvData;

    // Apply search filter
    if (searchTerm) {
      filtered = csvData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[sortColumn] || '');
        const bVal = String(b[sortColumn] || '');
        
        // Try to parse as numbers for better sorting
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return filtered;
  }, [csvData, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const downloadFile = () => {
    const blob = new Blob([attachment.rawContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadFiltered = () => {
    const headers = columns.join(',');
    const csvContent = [
      headers,
      ...filteredAndSortedData.map(row => 
        columns.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_${attachment.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `Filtered data (${filteredAndSortedData.length} rows) downloaded`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {attachment.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedData.length} of {csvData.length} rows • {columns.length} columns
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={downloadFiltered} disabled={filteredAndSortedData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Download Filtered
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="h-4 w-4 mr-2" />
                Download Original
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Search and controls */}
        <div className="flex items-center gap-4 p-4 border-b">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search across all columns..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{column}</span>
                      <ArrowUpDown 
                        className={`h-3 w-3 ${
                          sortColumn === column 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <TableCell key={column} className="font-mono text-sm">
                      {String(row[column] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No rows match your search criteria' : 'No data available'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVViewer;