/**
 * Base interface for component props that includes common properties
 */
export interface BaseComponentProps {
  /**
   * Optional CSS class names to apply to the component
   */
  className?: string;

  /**
   * Optional ID for the component
   */
  id?: string;

  /**
   * Optional style object for inline styling
   */
  style?: React.CSSProperties;

  /**
   * Optional ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Optional data attributes
   */
  [key: `data-${string}`]: string | number | boolean | undefined;
}
