/**
 * Responsive Design Utilities
 * Provides tools for implementing responsive designs following a mobile-first approach.
 */
import { breakpoints } from './design-tokens';

/**
 * Media query helper for CSS-in-JS libraries like styled-components
 * Usage example:
 * const Component = styled.div`
 *   width: 100%;
 *   ${media.sm`
 *     width: 50%;
 *   `}
 *   ${media.lg`
 *     width: 33%;
 *   `}
 * `;
 */
type BreakpointKey = keyof typeof breakpoints;

export const media = Object.keys(breakpoints).reduce((acc, label) => {
  acc[label as BreakpointKey] = (strings: TemplateStringsArray, ...args: any[]) => {
    const result = strings.reduce((result, string, i) => {
      return result + string + (args[i] || '');
    }, '');
    return `@media (min-width: ${breakpoints[label as BreakpointKey]}) { ${result} }`;
  };
  return acc;
}, {} as Record<BreakpointKey, (strings: TemplateStringsArray, ...args: any[]) => string>);

/**
 * Responsive value handler for props that change at different breakpoints
 * Usage example:
 * <Box margin={responsive({ base: '1rem', md: '2rem', lg: '3rem' })} />
 */
export type ResponsiveValue<T> = {
  base?: T;
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

/**
 * Generates Tailwind CSS classes for responsive values
 * @param classPrefix The prefix of the Tailwind class (e.g., "p", "m", "w")
 * @param value The responsive value object or single value
 * @param valueTransform Optional function to transform the value before applying
 * @returns A string of space-separated CSS classes
 * 
 * Usage example:
 * <div className={responsiveClass('p', { base: '4', md: '6', lg: '8' })} />
 * Result: "p-4 md:p-6 lg:p-8"
 */
export function responsiveClass<T>(
  classPrefix: string,
  value: T | ResponsiveValue<T>,
  valueTransform?: (val: T) => string
): string {
  // If it's not an object or is null, handle as a single value
  if (!value || typeof value !== 'object') {
    return `${classPrefix}-${valueTransform ? valueTransform(value as T) : value}`;
  }

  const responsiveObj = value as ResponsiveValue<T>;
  const classes: string[] = [];

  // Add the base/mobile class without a breakpoint prefix
  if (responsiveObj.base !== undefined) {
    const baseValue = valueTransform ? valueTransform(responsiveObj.base) : responsiveObj.base;
    classes.push(`${classPrefix}-${baseValue}`);
  }

  // Add classes for each breakpoint
  (Object.keys(responsiveObj) as Array<keyof ResponsiveValue<T>>).forEach(breakpoint => {
    if (breakpoint !== 'base' && responsiveObj[breakpoint] !== undefined) {
      const breakpointValue = valueTransform 
        ? valueTransform(responsiveObj[breakpoint] as T) 
        : responsiveObj[breakpoint];
      classes.push(`${breakpoint}:${classPrefix}-${breakpointValue}`);
    }
  });

  return classes.join(' ');
}

/**
 * Helper for conditional display based on breakpoints
 * Returns Tailwind CSS classes to hide/show elements at different breakpoints
 * 
 * @param breakpointConfig Configuration object defining visibility at breakpoints
 * @returns A string of space-separated CSS classes
 * 
 * Usage example:
 * <div className={hideShow({ hideBelow: 'md', hideAbove: 'xl' })} />
 * Result: "hidden md:block xl:hidden"
 */
interface HideShowConfig {
  /** Hide below specified breakpoint */
  hideBelow?: BreakpointKey;
  /** Hide above specified breakpoint */
  hideAbove?: BreakpointKey;
  /** Show only at specified breakpoints */
  showOnly?: BreakpointKey[];
  /** Hide only at specified breakpoints */
  hideOnly?: BreakpointKey[];
}

export function hideShow(config: HideShowConfig): string {
  const classes: string[] = [];

  if (config.hideBelow) {
    classes.push('hidden');
    classes.push(`${config.hideBelow}:block`);
  }

  if (config.hideAbove) {
    classes.push(`${config.hideAbove}:hidden`);
  }

  if (config.showOnly && config.showOnly.length) {
    classes.push('hidden');
    config.showOnly.forEach(bp => {
      classes.push(`${bp}:block`);
    });
  }

  if (config.hideOnly && config.hideOnly.length) {
    config.hideOnly.forEach(bp => {
      classes.push(`${bp}:hidden`);
    });
  }

  return classes.join(' ');
}

/**
 * Helper function to generate responsive grid classes
 * 
 * @param columns Object with responsive column counts
 * @returns A string of Tailwind grid classes
 * 
 * Usage example:
 * <div className={`grid ${responsiveGrid({ base: 1, sm: 2, md: 3, lg: 4 })}`} />
 * Result: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
 */
export function responsiveGrid(columns: ResponsiveValue<number>): string {
  return responsiveClass('grid-cols', columns);
}

/**
 * Helper function to create responsive flex layouts
 * 
 * @param direction Responsive flex direction
 * @returns A string of Tailwind flex direction classes
 * 
 * Usage example:
 * <div className={`flex ${responsiveFlex({ base: 'col', md: 'row' })}`} />
 * Result: "flex-col md:flex-row"
 */
export function responsiveFlex(
  direction: ResponsiveValue<'row' | 'col' | 'row-reverse' | 'col-reverse'>
): string {
  return responsiveClass('flex', direction);
} 