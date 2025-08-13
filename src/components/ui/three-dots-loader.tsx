import { cn } from "@/lib/utils";

interface ThreeDotsLoaderProps {
  className?: string;
}

const ThreeDotsLoader = ({ className }: ThreeDotsLoaderProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex space-x-1">
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
        />
      </div>
    </div>
  );
};

export default ThreeDotsLoader;