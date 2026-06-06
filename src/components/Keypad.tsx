/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (value: string) => void;
  isExpressionEmpty: boolean;
  hasMemory: boolean;
}

export function Keypad({ onKeyPress, isExpressionEmpty, hasMemory }: KeypadProps) {
  // Memory buttons
  const memoryButtons = [
    { value: 'MC', label: 'MC', title: 'Memory Clear' },
    { value: 'MR', label: 'MR', title: 'Memory Recall' },
    { value: 'M+', label: 'M+', title: 'Memory Add' },
    { value: 'M-', label: 'M-', title: 'Memory Subtract' },
  ];

  // Primary calculator buttons configuration
  const buttonRows = [
    [
      { value: 'C', label: isExpressionEmpty ? 'AC' : 'C', type: 'function', title: 'Clear' },
      { value: '(', label: '(', type: 'function', title: 'Open parenthesis' },
      { value: ')', label: ')', type: 'function', title: 'Close parenthesis' },
      { value: '÷', label: '÷', type: 'operator', title: 'Divide' },
    ],
    [
      { value: '7', label: '7', type: 'digit' },
      { value: '8', label: '8', type: 'digit' },
      { value: '9', label: '9', type: 'digit' },
      { value: '×', label: '×', type: 'operator', title: 'Multiply' },
    ],
    [
      { value: '4', label: '4', type: 'digit' },
      { value: '5', label: '5', type: 'digit' },
      { value: '6', label: '6', type: 'digit' },
      { value: '-', label: '−', type: 'operator', title: 'Subtract' },
    ],
    [
      { value: '1', label: '1', type: 'digit' },
      { value: '2', label: '2', type: 'digit' },
      { value: '3', label: '3', type: 'digit' },
      { value: '+', label: '+', type: 'operator', title: 'Add' },
    ],
    [
      { value: '⌫', label: '⌫', type: 'backspace', title: 'Delete last entry' },
      { value: '0', label: '0', type: 'digit' },
      { value: '.', label: '.', type: 'digit' },
      { value: '=', label: '=', type: 'equals', title: 'Evaluate expression' },
    ],
  ];

  const getButtonStyles = (type: string) => {
    switch (type) {
      case 'operator':
        return 'bg-[#E67E22] hover:bg-[#D35400] active:bg-[#B34500] text-white shadow-sm font-semibold text-xl';
      case 'equals':
        return 'bg-[#1ABC9C] hover:bg-[#16A085] active:bg-[#117A65] text-white shadow-md font-bold text-2xl';
      case 'function':
        return 'bg-[#DBD8D1] hover:bg-[#CBC7BF] active:bg-[#BAB6AF] text-[#4A4945] font-semibold text-lg';
      case 'backspace':
        return 'bg-[#DBD8D1] hover:bg-[#CBC7BF] active:bg-[#BAB6AF] text-[#4A4945] flex items-center justify-center font-semibold text-lg';
      default:
        // Digit (normal keys)
        return 'bg-white hover:bg-[#F2EFEA] active:bg-[#EAE5DF] text-[#2C2B29] font-medium shadow-sm border border-[#EBE8E3] text-xl';
    }
  };

  return (
    <div id="calculator-keypad" className="flex flex-col gap-3">
      {/* Memory Utilities Row */}
      <div id="memory-row" className="grid grid-cols-4 gap-2 px-1">
        {memoryButtons.map((btn) => (
          <motion.button
            key={btn.value}
            id={`btn-mem-${btn.value}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onKeyPress(btn.value)}
            disabled={btn.value === 'MR' && !hasMemory}
            className={`py-2 text-[11px] font-mono font-bold tracking-wider rounded-lg transition-all duration-100 ${
              btn.value === 'MR' && !hasMemory
                ? 'bg-[#E4E1DA]/40 text-[#4A4945]/40 border-dashed cursor-not-allowed'
                : 'bg-[#E4E1DA] hover:bg-[#D4D1CA] active:bg-[#C4C1BA] text-[#4A4945] cursor-pointer'
            }`}
            title={btn.title}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* Main Grid Keys (5 rows by 4 columns) */}
      <div id="keys-grid" className="flex flex-col gap-2.5">
        {buttonRows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2.5">
            {row.map((btn) => (
              <motion.button
                key={btn.value}
                id={`btn-${btn.value}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onKeyPress(btn.value)}
                className={`h-14 sm:h-16 rounded-xl flex items-center justify-center select-none transition-all duration-100 cursor-pointer ${getButtonStyles(
                  btn.type
                )}`}
                title={btn.title || `Input ${btn.label}`}
              >
                {btn.value === '⌫' ? (
                  <Delete className="w-5 h-5 text-[#4A4945]" />
                ) : (
                  btn.label
                )}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
