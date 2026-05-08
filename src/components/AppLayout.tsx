import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { InitializeOrg } from './InitializeOrg';
import { Dashboard } from './Dashboard';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function AppLayout() {
  const { connected } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('hushhush_onboarded') === 'true');

  if (!connected) {
    return <Navigate to="/" replace />;
  }

  const handleOnboardComplete = () => {
    localStorage.setItem('hushhush_onboarded', 'true');
    setOnboarded(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black text-black dark:text-white font-sans select-none overflow-hidden transition-colors duration-300">
      {/* TOP HEADER */}
      <header className="h-16 shrink-0 border-b border-black dark:border-white flex items-center justify-between px-6 bg-transparent">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Hush Pay</h1>
          <div className="hidden md:flex items-center space-x-3 text-[10px] uppercase tracking-widest font-mono">
            <span>Devnet: 5NKPW...XFL</span>
            <span className="opacity-50">|</span>
            <span>Cluster: #456</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:scale-110 transition-transform flex items-center justify-center">
            {theme === 'dark' ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-black" />}
          </button>
          <div className="hidden sm:block text-[10px] font-mono border border-black dark:border-white px-3 py-1 bg-transparent uppercase">
            SESSION: ACTIVE
          </div>
          <WalletMultiButton className="!bg-black dark:!bg-white !text-white dark:!text-black !text-[11px] !font-bold !px-6 !py-1 !h-8 !uppercase !tracking-widest !rounded-none transition-transform hover:scale-105" />
        </div>
      </header>

      <div className="flex-1 flex overflow-y-auto md:overflow-hidden">
        {!onboarded ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center bg-white dark:bg-black">
             <InitializeOrg onComplete={handleOnboardComplete} />
          </div>
        ) : (
          <div className="flex-1 flex w-full">
            {/* CENTER MAIN */}
            <main className="flex-1 bg-transparent p-6 md:p-10 flex flex-col overflow-y-auto">
              <Dashboard />
            </main>
          </div>
        )}
      </div>

      {/* FOOTER TAPE */}
      <footer className="h-10 shrink-0 border-t border-black dark:border-white flex items-center overflow-hidden bg-transparent">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap text-black dark:text-white font-black text-[11px] uppercase tracking-widest font-mono">
          <span>SECURE ENCLAVE ACTIVE</span>
          <span>●</span>
          <span>SHARED SECRET: X25519</span>
          <span>●</span>
          <span>ZK-PAYROLL</span>
          <span>●</span>
          <span>STATE: LOCKED</span>
          <span>●</span>
          <span>SECURE ENCLAVE ACTIVE</span>
          <span>●</span>
          <span>SHARED SECRET: X25519</span>
          <span>●</span>
          <span>ZK-PAYROLL</span>
          <span>●</span>
          <span>STATE: LOCKED</span>
        </div>
      </footer>
    </div>
  );
}
