/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  light?: boolean;
}

export default function Logo({ className = '', size = 'md', withText = true, light = false }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = "https://i.imgur.com/bd0HgBQ.png";

  // Dimensions based on size choice
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-32 w-32',
    xl: 'h-52 w-52',
  };

  const textColor = light ? 'text-[#FDFBF7]' : 'text-[#3E2723]';
  const subtitleColor = light ? 'text-[#E6C15C]' : 'text-[#D4AF37]';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {!imgError ? (
        <img
          src={imageUrl}
          alt="Kahayag Brew Logo"
          className={`${sizeClasses[size]} object-contain`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          className={sizeClasses[size]}
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Kahayag Brew Logo"
        >
        {/* Rounded Capsule Outer Border */}
        <rect
          x="60"
          y="30"
          width="180"
          height="340"
          rx="90"
          stroke={light ? '#FFFDF9' : '#3E2723'}
          strokeWidth="7"
          fill="none"
        />

        {/* Sun Rays (9 Rays in upper semi-circle) */}
        <g stroke={light ? '#E6C15C' : '#D4AF37'} strokeWidth="5" strokeLinecap="round">
          {/* Ray 1 (Left 180 deg) */}
          <line x1="100" y1="150" x2="115" y2="150" />
          {/* Ray 2 (145 deg) */}
          <line x1="104" y1="126" x2="117" y2="133" />
          {/* Ray 3 (120 deg) */}
          <line x1="116" y1="106" x2="128" y2="118" />
          {/* Ray 4 (100 deg) */}
          <line x1="134" y1="92" x2="142" y2="108" />
          {/* Ray 5 (Top 90 deg) */}
          <line x1="150" y1="85" x2="150" y2="103" />
          {/* Ray 6 (80 deg) */}
          <line x1="166" y1="92" x2="158" y2="108" />
          {/* Ray 7 (60 deg) */}
          <line x1="184" y1="106" x2="172" y2="118" />
          {/* Ray 8 (35 deg) */}
          <line x1="196" y1="126" x2="183" y2="133" />
          {/* Ray 9 (Right 0 deg) */}
          <line x1="200" y1="150" x2="185" y2="150" />
        </g>

        {/* Coffee Bean (Centered in the upper capsule) */}
        <g transform="translate(150, 150)">
          {/* Outer Bean Body */}
          <ellipse
            cx="0"
            cy="0"
            rx="26"
            ry="38"
            fill={light ? '#4E3629' : '#FFFDF9'}
            stroke={light ? '#E6C15C' : '#D4AF37'}
            strokeWidth="5"
          />
          {/* Center S-Curve Split Path */}
          <path
            d="M 0 -38 C -10 -15, 10 15, 0 38"
            fill="none"
            stroke={light ? '#E6C15C' : '#D4AF37'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Wavy Fields/Steam (Overlay in middle capsule) */}
        <g stroke={light ? '#FFFDF9' : '#3E2723'} strokeWidth="5" strokeLinecap="round" fill="none">
          {/* Wave Left */}
          <path d="M 68 215 C 80 200, 120 200, 140 215" />
          <path d="M 68 235 C 80 220, 120 220, 142 235" />
          <path d="M 70 255 C 85 240, 120 240, 140 255" />

          {/* Wave Right */}
          <path d="M 130 250 C 150 205, 215 205, 230 250" />
          <path d="M 135 230 C 152 195, 213 195, 228 230" />
          <path d="M 140 210 C 155 185, 210 185, 225 210" />
        </g>

        {/* Bold Kahayag Typography */}
        <text
          x="150"
          y="288"
          textAnchor="middle"
          fill={light ? '#FFFDF9' : '#3E2723'}
          fontFamily="Georgia, serif"
          fontWeight="bold"
          fontSize="41"
          letterSpacing="-0.5"
        >
          kahayag
        </text>

        {/* Spaced out BREW Subtitle */}
        <text
          x="150"
          y="325"
          textAnchor="middle"
          fill={light ? '#E6C15C' : '#D4AF37'}
          fontFamily="Georgia, serif"
          fontWeight="bold"
          fontSize="13"
          letterSpacing="6"
        >
          BREW
        </text>
      </svg>
      )}
    </div>
  );
}
