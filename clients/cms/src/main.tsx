import { createRoot } from 'react-dom/client';
import { App } from '@/app';
import { initializeApiClient } from '@kiosk-zsp4/shared/lib/api-client';
import { env } from '@/config/env';
import '@kiosk-zsp4/shared/styles/globals.css';
import '@/styles/globals.css';

initializeApiClient(env.API_URL);

createRoot(document.getElementById('root')!).render(<App />);
