import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';

interface MarcioAvatarProps {
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MarcioAvatar: React.FC<MarcioAvatarProps> = ({ avatarUrl, size = 'lg' }) => {
  const [loadError, setLoadError] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32 md:w-36 md:h-36',
    xl: 'w-40 h-40 md:w-44 md:h-44',
  }[size];

  const hasCustomValidAvatar = Boolean(avatarUrl && !loadError);

  return (
    <div className="relative inline-block group">
      {/* Subtle gold ambient glow around portrait */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#C5973D]/40 via-[#E8D5A0]/20 to-transparent blur-md opacity-75 group-hover:opacity-100 transition-opacity" />

      {/* Main Avatar Container */}
      <div
        className={`relative ${sizeClasses} rounded-full overflow-hidden border-2 border-[#C5973D]/50 bg-gradient-to-b from-[#202227] via-[#16171A] to-[#0D0E10] shadow-2xl flex items-center justify-center`}
      >
        {hasCustomValidAvatar ? (
          <img
            src={avatarUrl}
            alt="Márcio Rogério - Corretor de Imóveis"
            referrerPolicy="no-referrer"
            onError={() => setLoadError(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          /* Tailored Executive Silhouette & Paraná Araucária / Skyline Aesthetic */
          <div className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden bg-[#15171C]">
            {/* Paraná Horizon & Stylized Araucária Pines */}
            <svg
              viewBox="0 0 160 160"
              className="absolute inset-0 w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gentle rolling hills of Mandirituba / Paraná */}
              <path
                d="M0 120 C40 105, 80 115, 120 108 C140 105, 155 112, 160 120 L160 160 L0 160 Z"
                fill="#1A1C22"
                opacity="0.7"
              />
              {/* Stylized Araucária pine tree on left horizon */}
              <line x1="28" y1="125" x2="28" y2="82" stroke="#252730" strokeWidth="2" />
              <path d="M16 80 C24 76, 32 76, 40 80 C36 84, 20 84, 16 80 Z" fill="#2A2D38" />
              <path d="M19 75 C25 72, 31 72, 37 75 C34 78, 22 78, 19 75 Z" fill="#303440" />

              {/* Stylized Araucária pine tree on right horizon */}
              <line x1="135" y1="125" x2="135" y2="88" stroke="#252730" strokeWidth="2" />
              <path d="M125 86 C132 82, 138 82, 145 86 C142 89, 128 89, 125 86 Z" fill="#2A2D38" />

              {/* Soft warm sunset backlight horizon */}
              <circle cx="80" cy="80" r="45" fill="url(#sunGlow)" opacity="0.18" />
              <defs>
                <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#E8D5A0" />
                  <stop offset="100%" stopColor="#15171C" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            {/* Stylized Executive Portrait (Charcoal Blazer & Crisp Collar) */}
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head / Profile */}
              <circle cx="60" cy="46" r="18" fill="#D2B59D" />
              {/* Hair styling */}
              <path
                d="M44 42 C44 28, 76 28, 76 42 C74 33, 62 31, 44 42 Z"
                fill="#1E1F24"
              />
              {/* Neck & Crisp White Shirt Collar */}
              <path d="M54 58 L66 58 L64 68 L56 68 Z" fill="#D2B59D" />
              <path d="M52 64 L60 74 L68 64 L65 62 L60 69 L55 62 Z" fill="#FFFFFF" />
              
              {/* Bespoke Dark Charcoal Blazer Shoulders */}
              <path
                d="M26 112 C28 85, 45 74, 52 72 L60 88 L68 72 C75 74, 92 85, 94 112 Z"
                fill="#22242B"
              />
              {/* Blazer Lapel details with gold tone stitching highlight */}
              <path
                d="M40 88 L52 72 L60 92 L68 72 L80 88"
                stroke="#C5973D"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* Pocket square subtle accent */}
              <rect x="74" y="90" width="8" height="2" rx="1" fill="#E8D5A0" opacity="0.9" />
            </svg>
          </div>
        )}
      </div>

      {/* Verified Consultation Badge */}
      <div
        className="absolute bottom-0 right-1 transform translate-x-1 -translate-y-1 w-7 h-7 rounded-full bg-[#151619] border border-[#C5973D] flex items-center justify-center text-[#E8D5A0] shadow-md"
        title="Consultoria Verificada"
      >
        <UserCheck className="w-3.5 h-3.5 stroke-[2]" />
      </div>
    </div>
  );
};
