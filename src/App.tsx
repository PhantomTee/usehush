import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ClientWalletProvider } from './providers/WalletProvider';
import { InitializeOrg } from './components/InitializeOrg';
import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <ClientWalletProvider>
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
            <WalletMultiButton className="!bg-white !text-black !text-[11px] !font-bold !px-4 !py-1 !h-8 !uppercase !tracking-tight !rounded-none" />
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto md:overflow-hidden">
          {/* LEFT RAIL */}
          <aside className="col-span-1 md:col-span-4 lg:col-span-3 border-r border-[#262626] bg-[#0A0A0A] p-6 flex flex-col overflow-y-auto">
            <InitializeOrg />
          </aside>

          {/* CENTER MAIN */}
          <main className="col-span-1 md:col-span-8 lg:col-span-9 bg-[#050505] p-6 md:p-10 flex flex-col overflow-y-auto">
            <Dashboard />
          </main>
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
    </ClientWalletProvider>
  );
}
