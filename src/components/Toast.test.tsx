import React from 'react';
import { render, screen, act, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast, ToastContainer, ToastMessage } from './Toast';

vi.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, layout, initial, animate, exit, ...rest }: any, ref: any) => {
      return require('react').createElement('div', { ref, ...rest }, children);
    }),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders a success toast by default', () => {
    render(<ToastContainer />);

    act(() => {
      toast('Operation successful');
    });

    const toastElement = screen.getByText('Operation successful');
    expect(toastElement).toBeInTheDocument();

    // Test that the success toast style is applied
    const toastContainer = toastElement.closest('.pointer-events-auto');
    expect(toastContainer).toHaveClass('bg-white', 'border-emerald-200', 'text-emerald-900');
  });

  it('renders an error toast when specified', () => {
    render(<ToastContainer />);

    act(() => {
      toast('Operation failed', 'error');
    });

    const toastElement = screen.getByText('Operation failed');
    expect(toastElement).toBeInTheDocument();

    // Test that the error toast style is applied
    const toastContainer = toastElement.closest('.pointer-events-auto');
    expect(toastContainer).toHaveClass('bg-white', 'border-rose-200', 'text-rose-900');
  });

  it('renders an info toast when specified', () => {
    render(<ToastContainer />);

    act(() => {
      toast('Some information', 'info');
    });

    const toastElement = screen.getByText('Some information');
    expect(toastElement).toBeInTheDocument();

    // Test that the info toast style is applied
    const toastContainer = toastElement.closest('.pointer-events-auto');
    expect(toastContainer).toHaveClass('bg-white', 'border-blue-200', 'text-blue-900');
  });

  it('automatically removes toast after 4000ms', () => {
    render(<ToastContainer />);

    act(() => {
      toast('Auto close test');
    });

    expect(screen.getByText('Auto close test')).toBeInTheDocument();

    // Fast-forward 3999ms - should still be there
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(screen.getByText('Auto close test')).toBeInTheDocument();

    // Fast-forward past 4000ms.
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // AnimatePresence in Framer Motion uses requestAnimationFrame or other async ways to remove nodes.
    // However, when we click close, it actually fires setToasts to filter it out.
    // In test environment, the `layout` and `exit` props on `motion.div` might cause the element to linger.
    // Instead of waiting, we will just test that the length of toast arrays changed or use waitFor
    // But since we are using vi.useFakeTimers(), waitFor won't work easily with requestAnimationFrame.

    // Wait for the exit animation explicitly
    act(() => {
      vi.runAllTimers();
    });

    // We can just verify the toast message is removed by mocking Framer Motion,
    // but the easiest is to just use a timeout mock. Or wait for the DOM mutation.
    expect(screen.queryByText('Auto close test')).not.toBeInTheDocument();
  });

  it('manually removes toast when close button is clicked', () => {
    render(<ToastContainer />);

    act(() => {
      toast('Manual close test');
    });

    expect(screen.getByText('Manual close test')).toBeInTheDocument();

    const closeButton = screen.getByRole('button');

    act(() => {
      fireEvent.click(closeButton);
    });

    // Run timers for the exit animation
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Manual close test')).not.toBeInTheDocument();
  });
});
