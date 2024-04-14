import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MantineProvider>
      <Notifications />
        <App />
    </MantineProvider>
  </BrowserRouter>
);
