import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders photovault title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Photovault API Test in progress/i);
  expect(titleElement).toBeInTheDocument();
});