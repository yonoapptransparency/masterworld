import React from 'react';

export function HelmetProvider({ children }: { children: React.ReactNode; context?: any }) {
  return <>{children}</>;
}

interface HelmetProps {
  children?: React.ReactNode;
}

export function Helmet({ children }: HelmetProps) {
  // Return children directly so React 19's native document metadata hoisting handles it beautifully and safely
  return <>{children}</>;
}

