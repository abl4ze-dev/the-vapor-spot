import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

const GlassCard = ({ children, className, hover = false, style }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        hover ? 'glass-card-hover' : 'glass-card',
        'p-6',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;
