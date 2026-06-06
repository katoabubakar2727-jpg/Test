/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, Trash2, Clipboard } from 'lucide-react';
import { motion } from 'motion/react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
}

export function HistorySidebar({
  history,
  onSelectExpression,
  onSelectResult,
  onClearHistory,
}: HistorySidebarProps) {
  return (
    <div id="calculator-history" className="flex flex-col h-full bg-[#1A1A19] text-[#E5E2DC] rounded-2xl p-5 border border-white/5 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-sans font-medium tracking-wide uppercase text-[#A0A09A]">
            Computation Logs
          </h2>
        </div>
        {history.length > 0 && (
          <button
            id="clear-history-button"
            onClick={onClearHistory}
            className="p-1.5 text-[#A0A09A] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Clear all mathematical history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px] md:max-h-[380px] scrollbar-thin scrollbar-thumb-white/10">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-60">
            <p className="text-xs font-mono text-[#82827C]">No historic values recorded yet.</p>
          </div>
        ) : (
          history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group relative"
            >
              <div className="flex flex-col items-end gap-1.5">
                {/* Clickable expression to append/set expression */}
                <button
                  onClick={() => onSelectExpression(item.expression)}
                  className="text-right text-[#A0A09A] hover:text-white font-mono text-xs cursor-pointer select-all truncate max-w-full text-left"
                  title="Click to reuse expression"
                >
                  {item.expression} =
                </button>
                {/* Clickable result to set as display value */}
                <div className="flex items-center gap-2 justify-end w-full">
                  <button
                    onClick={() => onSelectResult(item.result)}
                    className="text-right text-orange-400 hover:text-orange-300 font-mono text-lg font-semibold cursor-pointer select-all truncate"
                    title="Click to copy value to display"
                  >
                    {item.result}
                  </button>
                </div>
              </div>
              
              {/* Copy Indicator Help text popup */}
              <div className="absolute left-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                <span className="text-[9px] text-[#82827C] font-mono">Use formula / output</span>
              </div>
              
              <div className="text-[9px] text-[#63635E] font-mono mt-1 text-right">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
