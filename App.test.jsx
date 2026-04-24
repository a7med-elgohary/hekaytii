import { render, screen } from '@testing-library/react';
import App from './App';

describe('App landing page', () => {
  test('renders main navbar links and sections', () => {
    render(<App />);

    expect(screen.getAllByRole('link', { name: 'من نحن' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'المميزات' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'فتح القائمة' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /كيف/i })).toBeInTheDocument();
  });
});
