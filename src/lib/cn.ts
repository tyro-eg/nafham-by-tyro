import clsx, { ClassValue } from 'clsx';

/**
 * Utility function to merge class names conditionally
 *
 * @param inputs - Class names, objects, or conditional expressions
 * @returns Merged class name string
 *
 * @example
 * // Basic usage
 * cn('base-class', 'another-class')
 * // Result: "base-class another-class"
 *
 * @example
 * // Conditional classes
 * cn('base-class', isActive && 'active')
 * // Result: "base-class active" (if isActive is true)
 *
 * @example
 * // Object syntax
 * cn({ 'card': true, 'card--highlighted': isHighlighted })
 * // Result: "card card--highlighted" (if isHighlighted is true)
 *
 * @see README.md for more examples and usage patterns
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
