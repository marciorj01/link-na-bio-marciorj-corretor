import React, { useState } from 'react';
import { Building2, Compass } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  label?: string;
  category?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  label,
  category,
}) => {
  const [hasError, setHasError] = useState(!src);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`photo-card-fallback relative overflow-hidden bg-gradient-to-br from-[#1A1C20] via-[#151619] to-[#0E0F12] border border-white/10 flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
      >
        {/* Subtle architectural grid lines */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Ambient warm gradient halo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#C5973D]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-[#C5973D]/40 flex items-center justify-center text-[#E8D5A0] mb-3 shadow-inner">
            <Building2 className="w-6 h-6 stroke-[1.8]" />
          </div>
          {category && (
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4AF37] mb-1 drop-shadow-sm">
              {category}
            </span>
          )}
          <span className="text-sm font-serif font-bold text-white max-w-[200px] leading-snug drop-shadow-md">
            {label || alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#151619] ${className}`}>
      {/* Shimmer placeholder before image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#1A1C20] animate-pulse flex items-center justify-center">
          <Compass className="w-6 h-6 text-white/10 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      />
    </div>
  );
};
