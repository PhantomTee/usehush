import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { InitializeOrg } from './InitializeOrg';
import { Dashboard } from './Dashboard';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navigate } from 'react-router-dom';

export function AppLayout() {
  const { connected } = useWallet();
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('hushhush_onboarded') === 'true');

  if (!connected) {
    return <Navigate to="/" replace />;
  }

  const handleOnboardComplete = () => {
    localStorage.setItem('hushhush_onboarded', 'true');
    setOnboarded(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-[#FAFAFA] font-sans select-none overflow-hidden">
      {/* TOP BAR / STATUS OVERLAY */}
      <header className="h-14 shrink-0 border-b border-[#262626] flex items-center justify-between px-6 bg-[#0A0A0A]">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-black tracking-tighter uppercase italic">HushHush Pay</h1>
          <div className="hidden md:flex items-center space-x-3 text-[10px] uppercase tracking-widest text-[#737373] font-mono">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            <span>Solana Devnet: 5NKPW...XFL</span>
            <span className="text-[#404040]">|</span>
            <span>Arcium Cluster: #456</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-[10px] font-mono border border-[#404040] px-3 py-1 rounded bg-[#171717]">
            SESSION_KEY: ACTIVE
          </div>
          <WalletMultiButton className="!bg-white !text-black !text-[11px] !font-bold !px-4 !py-1 !h-8 !uppercase !tracking-tight !rounded-full transition-transform hover:scale-105" />
        </div>
      </header>

      <div className="flex-1 flex overflow-y-auto md:overflow-hidden">
        {!onboarded ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 bg-[#050505]">
             <InitializeOrg onComplete={handleOnboardComplete} />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 w-full">
            {/* LEFT RAIL */}
            <aside className="col-span-1 md:col-span-4 lg:col-span-3 border-r border-[#262626] bg-[#0A0A0A] p-6 flex flex-col overflow-y-auto">
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-2">ORG STATUS</div>
              <div className="text-sm font-bold text-[#A3A3A3] mb-6">Initialized & Configured</div>
              <div className="p-4 border border-[#262626] rounded-sm bg-[#050505]">
                <div className="text-[9px] uppercase text-[#737373] font-bold mb-2">System Health</div>
                <div className="space-y-2 text-xs font-mono text-green-500">
                  <div className="flex justify-between">
                    <span>Arcium Nodes</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Smart Contract</span>
                    <span>SYNCED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Circuit Status</span>
                    <span>ACTIVE</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* CENTER MAIN */}
            <main className="col-span-1 md:col-span-8 lg:col-span-9 bg-[#050505] p-6 md:p-10 flex flex-col overflow-y-auto">
              <Dashboard />
            </main>
          </div>
        )}
      </div>

      {/* FOOTER TAPE */}
      <footer className="h-10 shrink-0 bg-cyan-500 flex items-center overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap text-black font-black text-[11px] uppercase tracking-tighter">
          <span>Real-time Secure Multi-Party Computation Active</span>
          <span>●</span>
          <span>Arcium Shared Secret Protocol: X25519</span>
          <span>●</span>
          <span>Solana Devnet TX: Validating 512-bit payload</span>
          <span>●</span>
          <span>RescueCipher State: Locked</span>
          <span>●</span>
          <span>Real-time Secure Multi-Party Computation Active</span>
          <span>●</span>
          <span>Arcium Shared Secret Protocol: X25519</span>
          <span>●</span>
          <span>Solana Devnet TX: Validating 512-bit payload</span>
          <span>●</span>
          <span>RescueCipher State: Locked</span>
        </div>
      </footer>
    </div>
  );
}
