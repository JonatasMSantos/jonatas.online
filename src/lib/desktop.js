import { createContext, useContext } from 'react';

// Ações do desktop disponíveis para o conteúdo das janelas (ex.: o terminal abrir apps).
export const DesktopContext = createContext({ open: () => {} });

export const useDesktop = () => useContext(DesktopContext);
