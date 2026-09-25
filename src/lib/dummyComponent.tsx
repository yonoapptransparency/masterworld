import React from 'react';

/**
 * Universal dummy component fallback
 * Resolves dynamically imported admin or public modules when stripped across isolated split repos
 */
export default function DummyComponent() {
  return null;
}
