import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClientWalletProvider } from './providers/WalletProvider';
import { LandingPage } from './components/LandingPage';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <ClientWalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </ClientWalletProvider>
  );
}

