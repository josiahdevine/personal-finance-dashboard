import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Header subcomponent
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Header content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardHeader component
 */
function CardHeader({ children, className = '', ...props }) {
  return (
    <div 
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Body subcomponent
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Body content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardBody component
 */
function CardBody({ children, className = '', ...props }) {
  return (
    <div 
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Footer subcomponent
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Footer content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardFooter component
 */
function CardFooter({ children, className = '', ...props }) {
  return (
    <div 
      className={`px-6 py-4 border-t border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card component for content containers
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} [props.header] - Card header content (alternative to using Card.Header)
 * @param {React.ReactNode} [props.footer] - Card footer content (alternative to using Card.Footer)
 * @param {boolean} [props.withShadow=true] - Whether to show shadow
 * @param {boolean} [props.withBorder=true] - Whether to show border
 * @param {boolean} [props.withRounded=true] - Whether to show rounded corners
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Card component
 */
function Card({ 
  children, 
  header, 
  footer, 
  withShadow = true, 
  withBorder = true,
  withRounded = true,
  className = '',
  ...props 
}) {
  const cardClasses = [
    'bg-white',
    withShadow ? 'shadow-md' : '',
    withBorder ? 'border border-gray-200' : '',
    withRounded ? 'rounded-lg' : '',
    className,
  ].join(' ').replace(/\s+/g, ' ').trim();

  // Check if children is an array or not
  const childArray = React.Children.toArray(children);
  
  // Filter for direct children that are CardHeader, CardBody, or CardFooter
  const headerChild = childArray.find(child => 
    React.isValidElement(child) && child.type === CardHeader
  );
  
  const bodyChildren = childArray.filter(child => 
    !React.isValidElement(child) || 
    (child.type !== CardHeader && child.type !== CardFooter)
  );
  
  const footerChild = childArray.find(child => 
    React.isValidElement(child) && child.type === CardFooter
  );

  // Determine what to render
  const headerContent = headerChild || (header ? <CardHeader>{header}</CardHeader> : null);
  const bodyContent = bodyChildren.length > 0 ? 
    (bodyChildren.some(child => React.isValidElement(child) && child.type === CardBody) ? 
      bodyChildren : 
      <CardBody>{bodyChildren}</CardBody>) : 
    null;
  const footerContent = footerChild || (footer ? <CardFooter>{footer}</CardFooter> : null);

  return (
    <div className={cardClasses} {...props}>
      {headerContent}
      {bodyContent}
      {footerContent}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  withShadow: PropTypes.bool,
  withBorder: PropTypes.bool,
  withRounded: PropTypes.bool,
  className: PropTypes.string,
};

// Assign subcomponents
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card; 