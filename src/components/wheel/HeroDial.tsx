'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export function HeroDial() {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;
    
    const runAnimation = async () => {
      // 1. Initial springy entrance
      try {
        await controls.start({
          rotate: [-80, 20, -10, 5, 0],
          transition: { duration: 2, ease: "easeOut", delay: 0.2 }
        });
      } catch (e) {
        // Ignore animation cancelation errors
      }
      
      if (!isMounted) return;
      
      // 2. Continuous unpredictable, calm sway with wider range
      try {
        await controls.start({
          rotate: [0, -45, 15, -10, 55, -25, -5, 40, -50, 20, -15, 35, 0],
          transition: {
            duration: 35,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
          }
        });
      } catch (e) {
        // Ignore unmounted errors
      }
    };
    
    runAnimation();
    
    return () => {
      isMounted = false;
      controls.stop();
    };
  }, [controls]);

  // SVG arc calculation helper
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

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
  
  return (
    <div className="relative w-full mx-auto flex justify-center items-end drop-shadow-[0px_8px_0px_#010f2c]">
      <motion.svg 
        viewBox="-10 -10 420 250" 
        className="w-full h-auto drop-shadow-2xl"
        initial={{ rotate: -20, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
      >
        {/* Base Semi-Circle */}
        <path 
          d={describeArc(CENTER, 200, RADIUS, 0, 180)} 
          fill="#eaf7cf" /* frosted_mint */
          className="opacity-20"
        />
        
        {/* The 5 Scoring Areas */}
        <path d={describeArc(CENTER, 200, RADIUS, 65, 75)} fill="#ef4444" />
        <path d={describeArc(CENTER, 200, RADIUS, 75, 85)} fill="#eab308" />
        <path d={describeArc(CENTER, 200, RADIUS, 85, 95)} fill="#1a8fe3" />
        <path d={describeArc(CENTER, 200, RADIUS, 95, 105)} fill="#eab308" />
        <path d={describeArc(CENTER, 200, RADIUS, 105, 115)} fill="#ef4444" />

        {/* The Dial/Pointer */}
        <motion.g
          animate={controls}
          initial={{ rotate: -80 }}
          style={{ originX: 210/420, originY: 210/250 }}
        >
          {/* Pointer line */}
          <line x1="200" y1="200" x2="200" y2="40" stroke="#010f2c" strokeWidth="8" strokeLinecap="round" />
          {/* Pointer needle tip */}
          <circle cx="200" cy="40" r="6" fill="#ffffff" />
          {/* Pointer base pivot (Dark) */}
          <circle cx="200" cy="200" r="24" fill="#010f2c" />
          {/* Pointer base pivot (White/Cream center) */}
          <circle cx="200" cy="200" r="12" fill="#ebefbf" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
