import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

/**
 * Modal component for displaying popup content
 * 
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.size='md'] - Modal size (sm, md, lg, xl, full)
 * @param {boolean} [props.closeOnClickOutside=true] - Whether to close modal when clicking outside
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @param {string} [props.className] - Additional CSS for the modal content
 * @returns {React.ReactPortal|null} - The Modal component
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  footer,
  className = '',
}) => {
  const modalRef = useRef(null);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Handle focus trap inside modal
  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      return () => {
        // Re-enable body scroll when unmounting
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);
  
  // Handle click outside modal
  const handleBackdropClick = (event) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };
  
  // Size classes for the modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };
  
  // Don't render anything if not open
  if (!isOpen) return null;
  
  // Otherwise, create a portal to the modal root element
  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      aria-labelledby={title ? 'modal-title' : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size] || 'max-w-md'} ${className}`}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h3 id="modal-title" className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  closeOnClickOutside: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  footer: PropTypes.node,
  className: PropTypes.string
};

export default Modal; 