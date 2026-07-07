import React, { type CSSProperties, type ReactNode } from 'react';

import { PopupHeader } from './PopupHeader';
import { PopupMain } from './PopupMain';

interface PopupPageLayoutProps {
  logoText: string;
  logoSub: string;
  navSection: string;
  navActive: string;
  nombre?: string;
  documento?: string;
  children: ReactNode;
  mainStyle?: CSSProperties;
}

export const PopupPageLayout: React.FC<PopupPageLayoutProps> = ({
  logoText,
  logoSub,
  navSection,
  navActive,
  nombre,
  documento,
  children,
  mainStyle,
}) => {
  return (
    <>
      <PopupHeader
        logoText={logoText}
        logoSub={logoSub}
        navSection={navSection}
        navActive={navActive}
        nombre={nombre}
        documento={documento}
      />

      <PopupMain style={mainStyle}>{children}</PopupMain>
    </>
  );
};