/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface DisplayProps {
  expression: string;
  displayValue: string;
  hasMemory: boolean;
  bracketCount: number;
}

export function Display({ expression, displayValue, hasMemory, bracketCount }: DisplayProps) {
  return (
    <div 
      id="calculator-display"
      className="w-full bg-[#1A1A19] text-white rounded-2xl p-6 mb-5 flex flex-col justify-end items-end relative overflow-hidden ring-1 ring-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] h-36"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Status Badges Row */}
      <div className="absolute top-4 left-6 flex items-center gap-2">
        {hasMemory && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-mono tracking-widest bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20"
          >
            M
          </motion.span>
        )}
        {bracketCount > 0 && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20"
          >
            ( {bracketCount} )
          </motion.span>
        )}
      </div>

      {/* Math Expression Line */}
      <div className="text-right text-[#A0A09A] font-mono text-sm tracking-tight mb-2 max-w-full overflow-x-auto whitespace-nowrap scrollbar-none h-6 flex items-center justify-end select-all">
        <motion.span 
          key={expression || 'empty'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {expression || <span className="opacity-0">0</span>}
        </motion.span>
      </div>

      {/* Main output display line */}
      <div className="w-full text-right font-mono font-medium tracking-tight text-3xl sm:text-4xl overflow-x-auto whitespace-nowrap scrollbar-none text-white select-all">
        <motion.span 
          key={displayValue}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
          className="inline-block"
        >
          {displayValue}
        </motion.span>
      </div>
    </div>
  );
}
