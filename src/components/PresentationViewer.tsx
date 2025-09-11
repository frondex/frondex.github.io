import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Play, Pause } from 'lucide-react';
import { FileAttachment } from '@/components/FilePreviewCard';

interface PresentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: FileAttachment;
}

export function PresentationViewer({ isOpen, onClose, attachment }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse slides from HTML content
  const slides = useMemo(() => {
    const content = attachment.rawContent;
    
    // Try to parse reveal.js style sections
    const sectionMatches = content.match(/<section[^>]*>([\s\S]*?)<\/section>/gi);
    if (sectionMatches && sectionMatches.length > 0) {
      return sectionMatches.map((section, index) => ({
        id: index,
        content: section,
        title: `Slide ${index + 1}`
      }));
    }
    
    // Fallback: split by h1, h2, or div with specific classes
    const slideDelimiters = content.split(/(?=<h[12][^>]*>)|(?=<div[^>]*class[^>]*slide)/i);
    if (slideDelimiters.length > 1) {
      return slideDelimiters.filter(slide => slide.trim()).map((slide, index) => ({
        id: index,
        content: `<div class="slide-content">${slide}</div>`,
        title: `Slide ${index + 1}`
      }));
    }
    
    // Single slide fallback
    return [{
      id: 0,
      content: `<div class="slide-content">${content}</div>`,
      title: 'Slide 1'
    }];
  }, [attachment.rawContent]);

  const totalSlides = slides.length;

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Auto-advance slides when playing
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev >= totalSlides - 1) {
            setIsPlaying(false);
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 3000); // 3 seconds per slide
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-screen max-h-screen w-screen h-screen' : 'max-w-4xl max-h-[80vh]'} p-0`}
      >
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>{attachment.name}</DialogTitle>
              <Badge variant="secondary">
                {currentSlide + 1} / {totalSlides}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {/* Slide Content */}
          <div className={`flex-1 ${isFullscreen ? 'p-8' : 'p-6'} bg-background overflow-auto`}>
            <div 
              className="h-full w-full bg-card rounded-lg border p-6 flex items-center justify-center"
              style={{ minHeight: isFullscreen ? '80vh' : '400px' }}
            >
              <div 
                className="w-full h-full prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: slides[currentSlide]?.content || '<p>No content available</p>' 
                }}
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Slide Thumbnails */}
              <div className="flex items-center gap-1 max-w-md overflow-x-auto">
                {slides.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentSlide === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToSlide(index)}
                    className="min-w-8 h-8"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}