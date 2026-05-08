import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClientWalletProvider } from './providers/WalletProvider';
import { LandingPage } from './components/LandingPage';
import { AppLayout } from './components/AppLayout';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ClientWalletProvider>
      <Toaster position="top-right" theme="system" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </ClientWalletProvider>
  );
}


