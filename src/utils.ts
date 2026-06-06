/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely evaluates mathematical expressions using a recursive descent parser.
 * Supports basic arithmetic (+, -, *, /), parentheses, decimals, and negative numbers.
 */
export function evaluateExpression(expr: string): number {
  // Replace visual operators with standard code operators
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');

  if (!sanitized) return 0;

  let index = 0;

  function peek(): string {
    return index < sanitized.length ? sanitized[index] : '';
  }

  function consume(): string {
    return index < sanitized.length ? sanitized[index++] : '';
  }

  function parseExpression(): number {
    let result = parseTerm();
    while (true) {
      const next = peek();
      if (next === '+') {
        consume();
        result += parseTerm();
      } else if (next === '-') {
        consume();
        result -= parseTerm();
      } else {
        break;
      }
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (true) {
      const next = peek();
      if (next === '*') {
        consume();
        result *= parseFactor();
      } else if (next === '/') {
        consume();
        const divisor = parseFactor();
        if (divisor === 0) {
          throw new Error('Cannot divide by zero');
        }
        result /= divisor;
      } else {
        break;
      }
    }
    return result;
  }

  function parseFactor(): number {
    const next = peek();
    if (next === '+') {
      consume();
      return parseFactor();
    }
    if (next === '-') {
      consume();
      return -parseFactor();
    }
    if (next === '(') {
      consume(); // consume '('
      const result = parseExpression();
      if (peek() === ')') {
        consume(); // consume ')'
      } else {
        throw new Error('Mismatched parentheses');
      }
      return result;
    }

    // Parse number
    let numStr = '';
    while (/[0-9.]/.test(peek())) {
      numStr += consume();
    }

    if (numStr === '') {
      throw new Error('Expected number');
    }

    const value = parseFloat(numStr);
    if (isNaN(value)) {
      throw new Error('Invalid number format');
    }
    return value;
  }

  const output = parseExpression();
  if (index < sanitized.length) {
    throw new Error('Invalid syntax');
  }
  return output;
}

/**
 * Format math output values cleanly
 */
export function formatResult(value: number): string {
  if (isNaN(value)) return 'Error';
  if (!isFinite(value)) return 'Infinity';
  
  // Clean decimal rounding (max 8 decimal places, strip trailing zeros)
  const fixed = value.toFixed(8);
  if (fixed.includes('.')) {
    return parseFloat(fixed).toString();
  }
  return value.toString();
}
