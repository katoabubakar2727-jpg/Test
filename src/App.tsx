/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistorySidebar } from './components/HistorySidebar';
import { evaluateExpression, formatResult } from './utils';
import { HistoryItem } from './types';
import { Calculator, Keyboard, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PWAManager } from './components/PWAManager';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(() => {
    const saved = localStorage.getItem('calc_memory_v1');
    return saved ? parseFloat(saved) : 0;
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('calc_history_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Sync memory & history to local storage when updated
  useEffect(() => {
    localStorage.setItem('calc_memory_v1', memory.toString());
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('calc_history_v1', JSON.stringify(history));
  }, [history]);

  // Count open bracket pairs in current expression
  const getBracketCount = useCallback((): number => {
    let count = 0;
    for (const char of expression) {
      if (char === '(') count++;
      if (char === ')') count--;
    }
    return Math.max(0, count);
  }, [expression]);

  const handleClear = useCallback(() => {
    setExpression('');
    setDisplayValue('0');
    setIsCalculated(false);
  }, []);

  const handleEvaluate = useCallback(() => {
    if (!expression) return;
    
    // Balance incomplete bracket sequences before calculation for smoother UX
    let finalExpression = expression;
    const missingBracketsCount = getBracketCount();
    for (let i = 0; i < missingBracketsCount; i++) {
      finalExpression += ')';
    }

    try {
      const resultValue = evaluateExpression(finalExpression);
      const cleanResult = formatResult(resultValue);
      
      setDisplayValue(cleanResult);
      
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        expression: finalExpression,
        result: cleanResult,
        timestamp: new Date()
      };
      
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); // Limit to last 50 entries
      setExpression(cleanResult);
      setIsCalculated(true);
    } catch (err: any) {
      setDisplayValue(err?.message || 'Error');
      setIsCalculated(true);
    }
  }, [expression, getBracketCount]);

  const handleKeyPress = useCallback((val: string) => {
    // 1. Clears
    if (val === 'C' || val === 'AC') {
      handleClear();
      return;
    }

    // 2. Evaluation
    if (val === '=') {
      handleEvaluate();
      return;
    }

    // 3. Backspace
    if (val === '⌫') {
      if (isCalculated) {
        handleClear();
        return;
      }
      if (expression.length > 0) {
        const nextExpr = expression.slice(0, -1);
        setExpression(nextExpr);
        
        // Update display to match the ending part of expression, or reset to 0
        const tokens = nextExpr.split(/[\+\-\*\/×÷\(\)]/);
        const lastToken = tokens[tokens.length - 1];
        setDisplayValue(lastToken || '0');
      } else {
        setDisplayValue('0');
      }
      return;
    }

    // 4. Memory registers
    if (['MC', 'MR', 'M+', 'M-'].includes(val)) {
      const parsedDisplay = parseFloat(displayValue);
      const currentNumber = isNaN(parsedDisplay) ? 0 : parsedDisplay;

      switch (val) {
        case 'MC':
          setMemory(0);
          break;
        case 'MR':
          setDisplayValue(memory.toString());
          if (isCalculated) {
            setExpression(memory.toString());
            setIsCalculated(false);
          } else {
            // Append memory representation to active calculation
            const updated = expression + memory.toString();
            setExpression(updated);
          }
          break;
        case 'M+':
          setMemory(prev => prev + currentNumber);
          break;
        case 'M-':
          setMemory(prev => prev - currentNumber);
          break;
      }
      return;
    }

    // 5. Parentheses
    if (val === '(' || val === ')') {
      if (val === ')') {
        // Only allow closing parenthesis if there's an unmatched open parenthesis
        if (getBracketCount() === 0) return;
      }

      let nextExpression = expression;
      if (isCalculated) {
        nextExpression = val;
        setIsCalculated(false);
      } else {
        nextExpression += val;
      }

      setExpression(nextExpression);
      setDisplayValue(val);
      return;
    }

    // 6. Operators (+, -, *, / expressed as visual operators)
    const normalizedOperator = val === '*' ? '×' : val === '/' ? '÷' : val;
    const isOperator = ['+', '-', '×', '÷'].includes(normalizedOperator);

    if (isOperator) {
      if (expression === '' && normalizedOperator !== '-') {
        // Don't allow starting with multiplication, division, or addition
        return;
      }

      let updatedExpression = expression;
      const lastChar = expression.slice(-1);
      const isLastCharOperator = ['+', '-', '×', '÷'].includes(lastChar);

      if (isLastCharOperator) {
        // Swap consecutive duplicate operators
        updatedExpression = expression.slice(0, -1) + normalizedOperator;
      } else {
        updatedExpression += normalizedOperator;
      }

      setExpression(updatedExpression);
      setIsCalculated(false);
      return;
    }

    // 7. Digits and Decimal Point
    if (/[0-9.]/.test(val)) {
      let nextExpression = expression;
      let nextDisplay = displayValue;

      // Handle fresh clean starts
      if (isCalculated) {
        nextExpression = val === '.' ? '0.' : val;
        nextDisplay = nextExpression;
        setIsCalculated(false);
      } else {
        const tokens = expression.split(/[+\-×÷()]/);
        const currentToken = tokens[tokens.length - 1] || '';

        if (val === '.') {
          // Guard against multiple consecutive decimals
          if (currentToken.includes('.')) return;
          
          if (currentToken === '') {
            nextExpression += '0.';
            nextDisplay = '0.';
          } else {
            nextExpression += '.';
            nextDisplay = currentToken + '.';
          }
        } else {
          // Standard digit input append
          nextExpression += val;
          nextDisplay = currentToken === '0' ? val : currentToken + val;
        }
      }

      setExpression(nextExpression);
      setDisplayValue(nextDisplay);
    }
  }, [expression, displayValue, isCalculated, memory, handleClear, handleEvaluate, getBracketCount]);

  // Keyboard shortcut listener hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events on auxiliary inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        handleKeyPress(key);
      } else if (key === '.') {
        handleKeyPress('.');
      } else if (key === '+') {
        handleKeyPress('+');
      } else if (key === '-') {
        handleKeyPress('-');
      } else if (key === '*' || key === 'x' || key === 'X') {
        handleKeyPress('×');
      } else if (key === '/') {
        e.preventDefault(); // Prevent page search trigger in browser
        handleKeyPress('÷');
      } else if (key === '(') {
        handleKeyPress('(');
      } else if (key === ')') {
        handleKeyPress(')');
      } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        handleKeyPress('=');
      } else if (key === 'Backspace') {
        handleKeyPress('⌫');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleKeyPress('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  // History callback linkages
  const pasteExpression = (expr: string) => {
    setExpression(expr);
    setIsCalculated(false);
  };

  const pasteResult = (res: string) => {
    setDisplayValue(res);
    setExpression(prev => {
      // If last char is digit or dot, overwrite it or start clean
      const lastChar = prev.slice(-1);
      const isLastCharDigitOrDot = /[0-9.]/.test(lastChar);
      
      if (isLastCharDigitOrDot || prev === '') {
        return res;
      } else {
        // Appends calculation value neatly onto operator chains
        return prev + res;
      }
    });
    setIsCalculated(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#1C1A17] selection:bg-orange-200 py-8 px-4 flex flex-col justify-between font-sans">
      
      {/* Decorative Top header ornament */}
      <h1 className="sr-only">Tactile Premium Calculator</h1>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        
        {/* Brand Banner Row */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#85827C]">Craftsmanship Series</span>
              <div className="text-base font-medium text-[#1A1A19] tracking-tight">Standard Calculator</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(prev => !prev)}
              className="p-2 text-[#85827C] hover:text-[#1A1A19] hover:bg-black/5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium font-mono"
              title="Show keyboard shortcuts help panel"
            >
              <Keyboard className="w-4 h-4" />
              <span>Shortcuts</span>
            </button>
          </div>
        </div>

        {/* Progressive Web App Support Banner and Alerts */}
        <PWAManager />

        {/* Unified Layout Stage (Bento Grid Style) */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Interactive Calculator Body (7 Column spans) */}
          <div className="md:col-span-7 flex flex-col">
            <div className="bg-[#ECE9E2] border border-[#DBD7CE] rounded-3xl p-6 shadow-[0_12px_40px_-12px_rgba(40,40,30,0.15)] flex flex-col justify-between relative h-full">
              {/* Subtle top glare/bevel element for tactile look */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-white/40 blur-[0.5px]" />
              
              <div>
                {/* Custom Display Output Panel */}
                <Display 
                  expression={expression}
                  displayValue={displayValue}
                  hasMemory={memory !== 0}
                  bracketCount={getBracketCount()}
                />

                {/* Tactile interactive mechanical button matrix */}
                <Keypad 
                  onKeyPress={handleKeyPress}
                  isExpressionEmpty={expression === ''}
                  hasMemory={memory !== 0}
                />
              </div>
            </div>
          </div>

          {/* Sibling Calculation Logs (5 Column spans) */}
          <div className="md:col-span-5 h-full">
            <HistorySidebar 
              history={history}
              onSelectExpression={pasteExpression}
              onSelectResult={pasteResult}
              onClearHistory={() => setHistory([])}
            />
          </div>

        </div>

        {/* Sliding Help Drawer container using Framer Motion */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full max-w-3xl mt-5 overflow-hidden"
            >
              <div className="p-4 bg-[#F2F0E8] border border-[#DDDCD5] rounded-2xl text-xs text-[#52514D]">
                <div className="flex items-center gap-2 mb-2 font-semibold font-sans uppercase tracking-wider text-[#353431]">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physical Keyboard Controls</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">0-9</kbd> Digit Input</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">Enter</kbd> / <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs text-[11px] font-bold">=</kbd> Solve</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">Backspace</kbd> Erase</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">Esc / C</kbd> Reset State</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">+</kbd> Addition</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">-</kbd> Subtraction</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">* / x</kbd> Multiplication</div>
                  <div className="p-2.5 bg-white/50 rounded-lg"><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 shadow-xs mr-1 text-[11px] font-bold">/</kbd> Division</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Humble aesthetic footer */}
      <footer className="mt-8 text-center text-[10px] font-mono tracking-wider text-[#A19E97]">
        Designed for precision and accessibility · Offline Supported · Press Esc to Clear any time
      </footer>

    </div>
  );
}
