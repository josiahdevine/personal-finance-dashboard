import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';
import { act } from 'react-dom/test-utils';

describe('Modal Component (Isolated)', () => {
  const mockOnClose = jest.fn();
  const modalTitle = 'Test Modal Title';
  const modalContent = 'Test Modal Content';

  beforeEach(() => {
    mockOnClose.mockReset();
  });

  test('renders the modal when isOpen is true', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        <p>{modalContent}</p>
      </Modal>
    );
    
    // Wait for modal to be fully rendered
    await waitFor(() => {
      // The title should be visible - use getByText instead of getByRole
      expect(screen.getByText(modalTitle)).toBeInTheDocument();
    });
    
    // The content should be visible
    expect(screen.getByText(modalContent)).toBeInTheDocument();
    
    // The close button should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('does not render the modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title={modalTitle}>
        <p>{modalContent}</p>
      </Modal>
    );
    
    // The title should not be visible
    expect(screen.queryByText(modalTitle)).not.toBeInTheDocument();
    
    // The content should not be visible
    expect(screen.queryByText(modalContent)).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        <p>{modalContent}</p>
      </Modal>
    );
    
    // Wait for modal to be fully rendered
    await waitFor(() => {
      expect(screen.getByText(modalTitle)).toBeInTheDocument();
    });
    
    // Find the close button (there should only be one button in the modal)
    const closeButton = screen.getByRole('button');
    
    // Click the close button
    act(() => {
      fireEvent.click(closeButton);
    });
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders children correctly', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        <div data-testid="custom-content">
          <button>Custom Button</button>
          <input type="text" placeholder="Custom Input" />
        </div>
      </Modal>
    );
    
    // Wait for modal to be fully rendered
    await waitFor(() => {
      expect(screen.getByText(modalTitle)).toBeInTheDocument();
    });
    
    // The custom content should be visible
    const customContent = screen.getByTestId('custom-content');
    expect(customContent).toBeInTheDocument();
    
    // The custom button should be visible
    expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
    
    // The custom input should be visible
    expect(screen.getByPlaceholderText('Custom Input')).toBeInTheDocument();
  });
}); 