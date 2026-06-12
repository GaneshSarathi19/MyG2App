import React, { createContext, useCallback, useContext, useState } from 'react';

type DrawerContextType = {
  open: boolean;
  toggle: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};


const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(s => !s), []);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  return <DrawerContext.Provider value={{ open, toggle, openDrawer, closeDrawer }}>{children}</DrawerContext.Provider>;
};

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
};

export default DrawerContext;
