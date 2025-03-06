import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AiAssistant } from '../AiAssistant';
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

const renderAiAssistant = () => {
  return render(<AiAssistant />);
};

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AiAssistant Component', () => {
  beforeEach(() => {
    server.resetHandlers();
    mockFetch.mockClear();
  });

  it('renders the AI assistant input', () => {
    renderAiAssistant();
    expect(screen.getByPlaceholderText(/ask me anything/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask/i })).toBeInTheDocument();
  });

  it('shows loading state while waiting for response', async () => {
    // Setup mock response
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'Test answer',
            suggestions: ['Suggestion 1', 'Suggestion 2'],
          }),
      })
    );

    renderAiAssistant();

    // Type a question and submit
    const input = screen.getByPlaceholderText(/ask me anything/i);
    fireEvent.change(input, { target: { value: 'Test question' } });
    
    const submitButton = screen.getByRole('button', { name: /ask/i });
    fireEvent.click(submitButton);

    // Verify loading state
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();

    // Wait for response
    await waitFor(() => {
      expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
    });

    // Verify response is displayed
    expect(screen.getByText('Test answer')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
  });

  it('displays AI response and suggestions', async () => {
    const mockResponse = {
      answer: 'Here is your answer',
      suggestions: ['Check your budget', 'Review investments'],
    };

    server.use(
      http.post('/api/ai/ask', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    renderAiAssistant();
    const input = screen.getByPlaceholderText(/ask me anything/i);
    const submitButton = screen.getByRole('button', { name: /ask/i });

    fireEvent.change(input, { target: { value: 'What should I do?' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(mockResponse.answer)).toBeInTheDocument();
      mockResponse.suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  it('shows error message when API call fails', async () => {
    // Setup mock error response
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );

    renderAiAssistant();

    // Type a question and submit
    const input = screen.getByPlaceholderText(/ask me anything/i);
    fireEvent.change(input, { target: { value: 'Test question' } });
    
    const submitButton = screen.getByRole('button', { name: /ask/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error getting response/i)).toBeInTheDocument();
    });
  });

  it('validates empty input', () => {
    renderAiAssistant();
    const submitButton = screen.getByRole('button', { name: /ask/i });

    fireEvent.click(submitButton);

    expect(screen.getByText(/please enter a question/i)).toBeInTheDocument();
  });

  it('clears input after successful response', async () => {
    server.use(
      http.post('/api/ai/ask', () => {
        return HttpResponse.json({
          answer: 'Test response',
          suggestions: [],
        });
      })
    );

    renderAiAssistant();
    const input = screen.getByPlaceholderText(/ask me anything/i);
    const submitButton = screen.getByRole('button', { name: /ask/i });

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('handles suggestion clicks', async () => {
    // Setup mock response
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'Test answer',
            suggestions: ['Click me'],
          }),
      })
    );

    renderAiAssistant();

    // Submit initial question
    const input = screen.getByPlaceholderText(/ask me anything/i);
    fireEvent.change(input, { target: { value: 'Initial question' } });
    
    const submitButton = screen.getByRole('button', { name: /ask/i });
    fireEvent.click(submitButton);

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    // Click suggestion
    fireEvent.click(screen.getByText('Click me'));

    // Verify input value is updated
    expect(input).toHaveValue('Click me');
  });
}); 