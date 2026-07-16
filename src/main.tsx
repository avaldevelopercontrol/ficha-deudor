//import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './shared/styles/index.css';
import { AuthProvider } from './features/auth/contexts';

//Se está desactivando porque ocurre error en mostrar solo por entorno local, en produccion no estaría con error

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  //</React.StrictMode>
);