import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const Logo = ({ size = 32, className = '', showText = false, textColor = 'text-white' }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Deep tech dark blue glowing backdrop circle */}
        <circle cx="100" cy="100" r="90" fill="#030712" />

        {/* Symmetric Cybernetic Lobe circuit background (glowing cyan structure) */}
        {/* Left Neural Lobe */}
        <path
          d="M85 35 L40 60 L40 140 L85 165 Z"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="6"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* Right Neural Lobe */}
        <path
          d="M115 35 L160 60 L160 140 L115 165 Z"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="6"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Internal connection lines & node circles */}
        <line x1="85" y1="35" x2="85" y2="165" stroke="#0891b2" strokeWidth="4" strokeDasharray="3 3" opacity="0.5" />
        <line x1="115" y1="35" x2="115" y2="165" stroke="#0891b2" strokeWidth="4" strokeDasharray="3 3" opacity="0.5" />

        {/* Cyber Nodes */}
        {/* Left Side Nodes */}
        <line x1="55" y1="70" x2="85" y2="85" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="55" cy="70" r="6" fill="#00f2fe" className="animate-pulse" />
        
        <line x1="45" y1="105" x2="80" y2="105" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="45" cy="105" r="6" fill="#00f2fe" />

        <line x1="55" y1="135" x2="85" y2="120" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="55" cy="135" r="6" fill="#00f2fe" />

        {/* Right Side Nodes */}
        <line x1="145" y1="70" x2="115" y2="85" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="145" cy="70" r="6" fill="#00f2fe" />

        <line x1="155" y1="105" x2="120" y2="105" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="155" cy="105" r="6" fill="#00f2fe" />

        <line x1="145" y1="135" x2="115" y2="120" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="145" cy="135" r="6" fill="#00f2fe" />

        {/* Dual center circuitry circles */}
        <circle cx="100" cy="55" r="8" fill="#00f2fe" stroke="#0891b2" strokeWidth="2" />
        <circle cx="100" cy="145" r="8" fill="#00f2fe" stroke="#0891b2" strokeWidth="2" />

        {/* Superimposed bold geometric "G" styled overlay */}
        {/* To make it solid and futuristic, we use a custom design for G */}
        <path
          d="M135 80 C128 65, 115 58, 100 58 C74 58, 56 78, 56 103 C56 128, 74 145, 100 145 C122 145, 134 135, 136 116 L100 116 L100 98 L152 98 L152 108 C152 135, 130 162, 100 162 C65 162, 38 135, 38 103 C38 71, 65 44, 100 44 C122 44, 140 54, 150 70 Z"
          fill="#083344"
          stroke="#00f2fe"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className={`font-display font-medium text-lg tracking-tight ${textColor}`}>
          Growth<span className="text-accent font-bold">Solution</span>
        </span>
      )}
    </div>
  );
};
