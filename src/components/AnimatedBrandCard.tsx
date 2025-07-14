import React from 'react';

interface AnimatedBrandCardProps {
  name: string;
  description: string;
  grayscaleImage: string;
  colorImage: string;
  detailedDescription: string;
}

const AnimatedBrandCard: React.FC<AnimatedBrandCardProps> = ({ 
  name, 
  description, 
  grayscaleImage, 
  colorImage, 
  detailedDescription 
}) => {
  return (
    <div className="relative w-full h-80 rounded-2xl cursor-pointer overflow-hidden group perspective-1000">
      {/* Default grayscale background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-0 z-10"
        style={{ backgroundImage: `url(${grayscaleImage})` }}
      />
      
      {/* Color background on hover */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-0 scale-95 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 z-20"
        style={{ backgroundImage: `url(${colorImage})` }}
      />
      
      {/* Elegant overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:from-black/80 group-hover:to-black/40 transition-all duration-500 z-30" />
      
      {/* Animated metallic borders */}
      <div className="absolute inset-0 border-2 border-white/20 group-hover:border-white/40 rounded-2xl transition-all duration-500 z-40" />
      
      {/* Premium corner accents */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transform rotate-45 transition-all duration-500 z-40" />
      <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-tl from-white/30 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transform -rotate-45 transition-all duration-500 z-40" />
      
      {/* Content container */}
      <div className="relative w-full h-full flex flex-col justify-end p-6 z-50">
        {/* Short description - visible by default, hidden on hover */}
        <p className="text-white/90 text-sm leading-relaxed mb-2 group-hover:opacity-0 transition-opacity duration-300">
          {description}
        </p>
        
        {/* Detailed description on hover */}
        <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
          <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
            {name}
          </h3>
          <p className="text-white text-sm leading-relaxed font-medium">
            {detailedDescription}
          </p>
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 transition-opacity duration-700 z-5" />
    </div>
  );
};

export default AnimatedBrandCard;