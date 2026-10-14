import React from 'react';

export const RECTorchIcon = ({ className = "w-9 h-9" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} flex-shrink-0`}
  >
    {/* Purple circular shield */}
    <circle cx="24" cy="24" r="23" fill="#681B97" stroke="#D4A017" strokeWidth="1.5" />
    
    {/* Torch flame - primary gold */}
    <path
      d="M24 7C24 7 18.5 13 18.5 18C18.5 20.8 20.2 22.8 22 23.8C20 22 17.5 19.2 19.5 14.5C19.5 14.5 20.8 16.8 22 17.8C22 13.5 24 10.5 24 7Z"
      fill="#D4A017"
    />
    {/* Torch flame - bright inner gold */}
    <path
      d="M24 7C24 7 29.5 13 29.5 18C29.5 20.8 27.8 22.8 26 23.8C28 22 30.5 19.2 28.5 14.5C28.5 14.5 27.2 16.8 26 17.8C26 13.5 24 10.5 24 7Z"
      fill="#F5C842"
      opacity="0.95"
    />
    {/* Core glowing flame */}
    <ellipse cx="24" cy="19.5" rx="3" ry="3.8" fill="#FFE082" />
    
    {/* Torch handle body */}
    <rect x="21.5" y="24" width="5" height="13" rx="2" fill="#FFFFFF" />
    
    {/* Iconic 'R' lettermark inside handle */}
    <text
      x="24"
      y="33.5"
      textAnchor="middle"
      fontSize="8.5"
      fontWeight="900"
      fontFamily="Inter, system-ui, sans-serif"
      fill="#681B97"
    >
      R
    </text>
    
    {/* Base collar */}
    <rect x="19" y="37" width="10" height="2.5" rx="1.25" fill="#FFFFFF" />
    <rect x="21" y="40" width="6" height="1.8" rx="0.9" fill="#D4A017" />
  </svg>
);

const RECLogo = ({
  size = "md",
  showSub = true,
  theme = "dark-header", // "dark-header" (for dark sidebar) or "light" (for white background)
  className = ""
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };

  const isDarkSurface = theme === "dark-header";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <RECTorchIcon className={iconSizes[size] || iconSizes.md} />
      {showSub && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black text-sm tracking-tight leading-tight ${
                isDarkSurface ? "text-white" : "text-slate-900"
              }`}
            >
              Campus<span className="text-[#D4A017]">Connect</span>
            </span>
            <span className="text-[10px] bg-[#681B97] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
              REC
            </span>
          </div>
          <p
            className={`text-[11px] font-medium leading-tight truncate ${
              isDarkSurface ? "text-purple-200/80" : "text-slate-500"
            }`}
          >
            Rajalakshmi Eng. College
          </p>
        </div>
      )}
    </div>
  );
};

export default RECLogo;
