import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingPage() {
  const { connected } = useWallet();

  const leftVariants = {
    rest: { x: 0 },
    hover: { 
      x: [0, -150, -150, 0],
      transition: { duration: 3, times: [0, 0.2, 0.8, 1], ease: "easeInOut" as const }
    }
  };

  const rightVariants = {
    rest: { x: 0 },
    hover: { 
      x: [0, 150, 150, 0],
      transition: { duration: 3, times: [0, 0.2, 0.8, 1], ease: "easeInOut" as const }
    }
  };

  const miniVariants = {
    rest: { scale: 0, opacity: 0 },
    hover: {
      scale: [0, 0.25, 0.25, 0.25],
      opacity: [1, 1, 1, 0],
      zIndex: 10,
      transition: { duration: 3, times: [0, 0.2, 0.8, 1], ease: "easeInOut" as const }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#FAFAFA] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-start p-6 md:p-8">
        <div className="text-xl md:text-2xl tracking-tighter">
          We are
        </div>
        
        <nav className="hidden md:flex space-x-6 text-[10px] font-bold tracking-widest uppercase mt-2">
          <a href="#" className="hover:opacity-70 transition-opacity">About MXE</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Privacy</a>
          <a href="https://docs.arcium.com" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity">Arcium Docs</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Why Confidential</a>
        </nav>

        <div className="z-10">
          {connected ? (
            <Link 
              to="/app"
              className="inline-flex items-center justify-center bg-white text-black text-[11px] font-bold px-6 py-2 h-10 uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
            >
              Enter App
            </Link>
          ) : (
            <div className="[&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-black [&_.wallet-adapter-button]:!text-[11px] [&_.wallet-adapter-button]:!font-bold [&_.wallet-adapter-button]:!px-6 [&_.wallet-adapter-button]:!py-2 [&_.wallet-adapter-button]:!h-10 [&_.wallet-adapter-button]:!uppercase [&_.wallet-adapter-button]:!tracking-widest [&_.wallet-adapter-button]:!rounded-full hover:[&_.wallet-adapter-button]:scale-105 [&_.wallet-adapter-button]:transition-transform">
              <WalletMultiButton />
            </div>
          )}
        </div>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 flex items-center justify-center px-4 -mt-16">
        <motion.div 
          className="relative flex items-center justify-center cursor-pointer select-none"
          whileHover="hover"
          initial="rest"
          animate="rest"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center text-[25vw] leading-none font-black tracking-tighter w-full text-center"
          >
            <motion.span variants={leftVariants} className="inline-block relative z-20">
              HU
            </motion.span>
            
            <motion.div
               className="absolute inset-0 flex items-center justify-center pointer-events-none"
               variants={miniVariants}
            >
              <span className="text-[25vw] text-white whitespace-nowrap">
                Hush Pay
              </span>
            </motion.div>

            <motion.span variants={rightVariants} className="inline-block relative z-20">
              SH
            </motion.span>
          </motion.h1>
        </motion.div>
      </main>

      {/* Footer Area */}
      <footer className="flex justify-between items-end p-6 md:p-8">
        <div className="max-w-md text-xl md:text-3xl leading-tight font-medium tracking-tight">
          A Confidential Payroll tool shaping the paths companies take next.
        </div>
        <div className="text-[10px] sm:text-xs font-bold tracking-widest uppercase flex items-center gap-1">
          Arcium Docs 
          <span className="text-lg">↳</span>
        </div>
      </footer>
    </div>
  );
}
