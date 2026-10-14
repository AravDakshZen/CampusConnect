/**
 * RECLogo  Rajalakshmi Engineering College Visual Identity
 * Purple (#681B97) + Gold (#D4A017) brand mark
 * Inspired by: torch of knowledge with "R" lettermark
 */

const RECLogo = ({ size = "md", showText = true, className = "" }) => {
  const sizes = {
    xs: { icon: 24, text: "text-xs" },
    sm: { icon: 32, text: "text-sm" },
    md: { icon: 40, text: "text-base" },
    lg: { icon: 56, text: "text-xl" },
    xl: { icon: 72, text: "text-2xl" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="24" fill="#681B97" />

        {/* Torch flame - gold */}
        <path
          d="M24 6C24 6 19 12 19 17C19 19.5 20.5 21.5 22 22.5C20 21 18 18.5 20 14C20 14 21 16 22 17C22 13 24 10 24 6Z"
          fill="#D4A017"
        />
        <path
          d="M24 6C24 6 29 12 29 17C29 19.5 27.5 21.5 26 22.5C28 21 30 18.5 28 14C28 14 27 16 26 17C26 13 24 10 24 6Z"
          fill="#F5C842"
          opacity="0.85"
        />
        <ellipse cx="24" cy="19" rx="3.5" ry="4" fill="#FFE082" opacity="0.7" />

        {/* Torch handle */}
        <rect x="22" y="23" width="4" height="14" rx="2" fill="white" opacity="0.95" />

        {/* R lettermark overlay on handle */}
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fontFamily="Inter, Arial, sans-serif"
          fill="#681B97"
        >
          R
        </text>

        {/* Bottom base of torch */}
        <rect x="19" y="36" width="10" height="3" rx="1.5" fill="white" opacity="0.9" />
        <rect x="21" y="39" width="6" height="2" rx="1" fill="#D4A017" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-black ${s.text} text-[#681B97] leading-none tracking-tight`}
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Campus<span style={{ color: "#D4A017" }}>Connect</span>
          </span>
          <span
            className="text-[10px] font-semibold text-slate-500 leading-none mt-0.5"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Rajalakshmi Engineering College
          </span>
        </div>
      )}
    </div>
  );
};

// Icon-only variant (for favicon / small spaces)
export const RECLogoIcon = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="24" cy="24" r="24" fill="#681B97" />
    <path
      d="M24 6C24 6 19 12 19 17C19 19.5 20.5 21.5 22 22.5C20 21 18 18.5 20 14C20 14 21 16 22 17C22 13 24 10 24 6Z"
      fill="#D4A017"
    />
    <path
      d="M24 6C24 6 29 12 29 17C29 19.5 27.5 21.5 26 22.5C28 21 30 18.5 28 14C28 14 27 16 26 17C26 13 24 10 24 6Z"
      fill="#F5C842"
      opacity="0.85"
    />
    <rect x="22" y="23" width="4" height="14" rx="2" fill="white" opacity="0.95" />
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="9"
      fontWeight="900"
      fontFamily="Inter, Arial, sans-serif"
      fill="#681B97"
    >
      R
    </text>
    <rect x="19" y="36" width="10" height="3" rx="1.5" fill="white" opacity="0.9" />
    <rect x="21" y="39" width="6" height="2" rx="1" fill="#D4A017" />
  </svg>
);

export default RECLogo;
