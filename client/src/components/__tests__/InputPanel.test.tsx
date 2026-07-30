import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputPanel } from '../InputPanel';

describe('InputPanel Component', () => {
  it('renders textarea and generate button', () => {
    render(<InputPanel onGenerate={jest.fn()} isLoading={false} />);

    expect(screen.getByPlaceholderText(/Paste your document/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Mindmap/i })).toBeInTheDocument();
  });

  it('disables generate button when text is empty or too short', () => {
    render(<InputPanel onGenerate={jest.fn()} isLoading={false} />);

    const button = screen.getByRole('button', { name: /Generate Mindmap/i });
    expect(button).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Paste your document/i);
    fireEvent.change(textarea, { target: { value: 'Too short text' } });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Please enter at least 20 characters/i)).toBeInTheDocument();
  });

  it('enables generate button and calculates token estimate on valid input', () => {
    const onGenerateMock = jest.fn();
    render(<InputPanel onGenerate={onGenerateMock} isLoading={false} />);

    const textarea = screen.getByPlaceholderText(/Paste your document/i);
    const validText = 'Software architecture principles cover microservices, REST APIs, and SQLite databases.';
    fireEvent.change(textarea, { target: { value: validText } });

    const button = screen.getByRole('button', { name: /Generate Mindmap/i });
    expect(button).not.toBeDisabled();
    expect(screen.getByText(/~22 tokens/i)).toBeInTheDocument();

    fireEvent.click(button);
    expect(onGenerateMock).toHaveBeenCalledWith(validText);
  });
});
