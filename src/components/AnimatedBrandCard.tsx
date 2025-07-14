import React from 'react';

interface AnimatedBrandCardProps {
  name: string;
  description: string;
  image: string;
}

const AnimatedBrandCard: React.FC<AnimatedBrandCardProps> = ({ name, description, image }) => {
  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-primary to-primary-foreground rounded-xl cursor-pointer overflow-hidden group">
      {/* Animated corner elements */}
      <div className="absolute top-0 right-0 w-1/5 h-1/5 bg-gradient-to-br from-accent to-accent-foreground transition-all duration-500 ease-out rounded-bl-full rounded-tr-xl group-hover:w-full group-hover:h-full group-hover:rounded-xl z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/5 h-1/5 bg-gradient-to-br from-accent to-accent-foreground transition-all duration-500 ease-out rounded-tr-full rounded-bl-xl group-hover:w-full group-hover:h-full group-hover:rounded-xl group-hover:bg-gradient-to-br group-hover:from-primary group-hover:via-secondary group-hover:to-accent z-10"></div>
      
      {/* Main content */}
      <div 
        className="relative w-full h-full bg-cover bg-center rounded-xl transition-transform duration-500 group-hover:scale-95 z-20"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 rounded-b-xl group-hover:from-black/90 group-hover:to-black/30 transition-all duration-300">
          <h3 className="text-xl font-bold mb-2 leading-tight">
            {name}
          </h3>
          <p className="text-sm opacity-90">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBrandCard;