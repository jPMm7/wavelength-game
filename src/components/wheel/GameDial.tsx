'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GameDialProps {
  targetAngle: number; // The secret target (0 to 180)
  guessAngle: number;  // The current guess (0 to 180)
  shutterOpen: boolean; // Whether the scoring wedges are visible
  interactive: boolean; // Whether the user can drag the needle
  onGuessChange?: (angle: number) => void; // Callback when needle moves
  individualGuesses?: { id: string; name: string; angle: number; color?: string }[];
  hideMainPointer?: boolean;
}

export function GameDial({ targetAngle, guessAngle, shutterOpen, interactive, onGuessChange, individualGuesses, hideMainPointer }: GameDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Math helper for wedges
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    // If the arc is invalid (e.g., negative), clamp it safely
    const startA = Math.max(0, startAngle);
    const endA = Math.min(180, endAngle);
    if (startA >= endA) return "";

    const start = polarToCartesian(x, y, radius, endA);
    const end = polarToCartesian(x, y, radius, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const CENTER = 200;
  const RADIUS = 180;

  // Handle Dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !interactive || !svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      
      // Calculate the center point of the dial in screen coordinates.
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.84; // 210/250 = 0.84
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      let normalizedAngle = 0;
      if (angle <= 0) {
        // Upper half (0 to -180) -> We want Right=180, Top=90, Left=0
        normalizedAngle = angle + 180; 
      } else {
        // Lower half
        if (angle > 90) normalizedAngle = 0; // clipped to left
        else normalizedAngle = 180; // clipped to right
      }
      
      if (onGuessChange) {
        onGuessChange(Math.round(normalizedAngle));
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, interactive, onGuessChange]);

  return (
    <div 
      className="relative w-full h-full max-w-2xl mx-auto flex justify-center items-end select-none touch-none min-h-0"
      onPointerDown={(e) => {
        if (interactive) setIsDragging(true);
      }}
    >
      <svg 
        ref={svgRef}
        viewBox="-10 -10 420 250" 
        className="w-full h-full max-h-full"
      >
        <g className="drop-shadow-[0px_8px_0px_#010f2c]">
          <g className="drop-shadow-2xl">
        {/* Base Semi-Circle */}
        <path 
          d={describeArc(CENTER, 200, RADIUS, 0, 180)} 
          fill="#eaf7cf" /* frosted_mint */
          className="opacity-20"
        />
        
        {/* Scoring Wedges (Only visible if Shutter is OPEN) */}
        {shutterOpen && (
          <g>
            {/* 2 Points Outer */}
            <path d={describeArc(CENTER, 200, RADIUS, targetAngle - 25, targetAngle - 15)} fill="#eab308" />
            <path d={describeArc(CENTER, 200, RADIUS, targetAngle + 15, targetAngle + 25)} fill="#eab308" />
            
            {/* 3 Points Inner */}
            <path d={describeArc(CENTER, 200, RADIUS, targetAngle - 15, targetAngle - 5)} fill="#ef4444" />
            <path d={describeArc(CENTER, 200, RADIUS, targetAngle + 5, targetAngle + 15)} fill="#ef4444" />
            
            {/* 4 Points Bullseye */}
            <path d={describeArc(CENTER, 200, RADIUS, targetAngle - 5, targetAngle + 5)} fill="#1a8fe3" />
          </g>
        )}

        {/* The Shutter (Visible if Shutter is CLOSED) */}
        {!shutterOpen && (
          <path 
            d={describeArc(CENTER, 200, RADIUS, 0, 180)} 
            fill="#010f2c" 
            className="opacity-40"
          />
        )}
          </g>
        </g>

        {/* The Individual Guesses (Faded Pointers) */}
        {individualGuesses && individualGuesses.map((guess) => {
           const labelPos = polarToCartesian(CENTER, 200, RADIUS + 25, guess.angle);
           return (
             <g key={guess.id}>
               <motion.g animate={{ rotate: guess.angle - 90 }} transition={{ type: "spring", bounce: 0.1, duration: 0.5 }} style={{ originX: 210/420, originY: 210/250 }}>
                 {/* Pointer line */}
                 <line x1="200" y1="200" x2="200" y2="40" stroke="#010f2c" strokeWidth="10" strokeLinecap="round" />
                 {/* Pointer needle tip */}
                 <circle cx="200" cy="40" r="8" fill={guess.color || "#ffffff"} className="drop-shadow-sm" />
                 {/* Pointer base pivot (Dark) */}
                 <circle cx="200" cy="200" r="32" fill="#010f2c" />
                 {/* Pointer base pivot (White/Cream center) */}
                 <circle cx="200" cy="200" r="16" fill="#ebefbf" />
               </motion.g>
               <motion.text 
                 animate={{ x: labelPos.x, y: labelPos.y }}
                 transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                 textAnchor="middle" 
                 alignmentBaseline="middle" 
                 fill={guess.color || "#ffffff"} 
                 fontSize="12" 
                 fontWeight="black" 
                 className="uppercase"
               >
                 {guess.name}
               </motion.text>
             </g>
           );
        })}

        {/* The Main Dial/Pointer */}
        {!hideMainPointer && (
          <motion.g
            animate={{ rotate: guessAngle - 90 }}
            transition={{ type: "spring", bounce: 0.1, duration: isDragging ? 0.05 : 0.5 }}
            style={{ originX: 210/420, originY: 210/250 }}
          >
            {/* Pointer line */}
            <line x1="200" y1="200" x2="200" y2="40" stroke="#010f2c" strokeWidth="10" strokeLinecap="round" />
            {/* Pointer needle tip */}
            <circle cx="200" cy="40" r="8" fill="#ffffff" className="drop-shadow-sm" />
            {/* Pointer base pivot (Dark) */}
            <circle cx="200" cy="200" r="32" fill="#010f2c" />
            {/* Pointer base pivot (White/Cream center) */}
            <circle cx="200" cy="200" r="16" fill="#ebefbf" />
          </motion.g>
        )}
      </svg>

      {/* Interactive Overlay Hint */}
      {interactive && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
          <span className="bg-black/50 text-white font-bold px-4 py-2 rounded-full animate-pulse backdrop-blur-sm">
            Drag to Rotate
          </span>
        </div>
      )}
    </div>
  );
}
