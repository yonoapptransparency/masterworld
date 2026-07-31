import React from 'react';

export const motion = {
  div: React.forwardRef(({ children, ...props }: any, ref) => {
    // Filter out framer-motion specific props that might cause issues
    const { layout, initial, animate, exit, ...rest } = props;
    return React.createElement('div', { ref, ...rest }, children);
  }),
};
export const AnimatePresence = ({ children }: any) => children;
