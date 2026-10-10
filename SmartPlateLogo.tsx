import React from 'react';

interface SmartPlateLogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  showTagline?: boolean;
  light?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SmartPlateLogo: React.FC<SmartPlateLogoProps> = ({
  size = 'md',
  showTagline = true,
  light = false,
  className = '',
  onClick,
}) => {
  const isCustomNumber = typeof size === 'number';
  const iconDimensions = isCustomNumber
    ? ''
    : {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-12 h-12',
      }[size];

  const customStyle = isCustomNumber ? { width: size, height: size } : undefined;

  const titleSize = typeof size === 'number' ? 'text-lg' : {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Plate & Rescue Leaf Emblem */}
      <div className={`relative ${iconDimensions} rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-500 p-0.5 shadow-md shadow-orange-500/20 shrink-0 flex items-center justify-center transition-transform hover:scale-105`}>
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* Inner Plate Ring */}
          <div className="w-[82%] h-[82%] rounded-full border border-orange-200/90 flex items-center justify-center bg-orange-50/50">
            {/* Fork & Leaf Fusion SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-orange-600"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Plate outline */}
              <circle cx="12" cy="12" r="9" stroke="#ea580c" strokeWidth="1.8" />
              {/* Leaf sprouting from the center - representing fresh rescue */}
              <path d="M12 7c-2 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1-4-3-6Z" fill="#10b981" stroke="#059669" strokeWidth="1.2" />
              {/* Clock/Pulse ticker accent */}
              <path d="M12 11v3l2 1" stroke="#ea580c" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight leading-none ${light ? 'text-white' : 'text-slate-900'} ${titleSize}`}>
            Smart<span className="text-orange-600">Plate</span>
          </span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
            CBE
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] tracking-tight truncate mt-0.5 font-medium ${light ? 'text-slate-300' : 'text-slate-500'}`}>
            Good Food. Better Distribution.
          </span>
        )}
      </div>
    </div>
  );
};
