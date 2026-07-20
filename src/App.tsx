/**
 * LOCAL DEVELOPMENT PROXY
 * This file is only used for local development in AI Studio.
 * During sync, it is OVERWRITTEN by either AppPublic.tsx (for Dex) or AppAdmin.tsx (for Masterworld).
 * DO NOT add routes here. Add them to AppPublic.tsx or AppAdmin.tsx directly.
 */
import React from 'react';
import AppPublic from './AppPublic';
import AppAdmin from './AppAdmin';
import { getAdminPath } from './lib/utils';

export default function App() {
  const adminPath = getAdminPath();
  const isAdminPath = window.location.pathname.startsWith(`/${adminPath}`);
  
  if (isAdminPath) {
    return <AppAdmin />;
  }
  return <AppPublic />;
}
