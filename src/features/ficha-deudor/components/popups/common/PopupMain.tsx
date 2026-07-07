import React, { type CSSProperties, type ReactNode } from 'react';

interface PopupMainProps {
  children: ReactNode;
  style?: CSSProperties;
}

export const PopupMain: React.FC<PopupMainProps> = ({ children, style }) => {
  return (
    <main className="popup-main" style={style}>
      {children}
    </main>
  );
};