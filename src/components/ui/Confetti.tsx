'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Confetti() {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    const generated = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      type: Math.random() > 0.5 ? 'rect' : 'circle'
    }));
    setPieces(generated);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: '-10vh', x: `${p.x}vw`, rotate: 0 }}
          animate={{ y: '110vh', rotate: p.rotation + 360, x: `${p.x + (Math.random() * 20 - 10)}vw` }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.type === 'rect' ? p.size * 1.5 : p.size,
            borderRadius: p.type === 'circle' ? '50%' : '0%',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
