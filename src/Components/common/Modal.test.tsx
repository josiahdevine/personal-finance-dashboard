import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const modalTitle = 'Test Modal Title';
  const modalContent = 'Test Modal Content';

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        <p>{modalContent}</p>
      </Modal>
    );
    
    expect(screen.getByText(modalTitle)).toBeInTheDocument();
    expect(screen.getByText(modalContent)).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title={modalTitle}>
        <p>{modalContent}</p>
      </Modal>
    );
    
    expect(screen.queryByText(modalTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(modalContent)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        <p>{modalContent}</p>
      </Modal>
    );
    
    // Find the close button (it has a span with "Close" text)
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
}); 