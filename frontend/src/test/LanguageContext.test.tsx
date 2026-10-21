import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

const TestComponent = () => {
  const { language, toggleLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="find-electricians">{t('navFind')}</span>
      <button onClick={toggleLanguage}>Toggle</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to English and renders translated text', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('find-electricians')).toBeInTheDocument();
  });

  it('toggles language between en and bn', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const toggleBtn = screen.getByText('Toggle');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('current-lang').textContent).toBe('bn');
    expect(localStorage.getItem('voltfix_language')).toBe('bn');

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(localStorage.getItem('voltfix_language')).toBe('en');
  });
});
