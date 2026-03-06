import { Cloud } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-xl animate-pulse" />
        
        {/* Logo container */}
        <img src="/cloud-essence-logo.png" alt="The Vapor Spot" className="relative w-20 h-20 rounded-2xl object-contain animate-bounce" />
      </div>
      
      <h1 className="text-2xl font-bold gradient-text mt-6 animate-pulse">
        The Vapor Spot
      </h1>
      
      <div className="flex gap-1 mt-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
