import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
