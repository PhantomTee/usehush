import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function LandingPage() {
  const { connected } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const isFirstRender = useRef(true);

  const controlsLeft = useAnimation();
  const controlsRight = useAnimation();
  const controlsMini = useAnimation();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const sequence = async () => {
      if (isHovered) {
        await Promise.all([
          controlsLeft.start({ x: -150, transition: { duration: 0.4, ease: "easeInOut" } }),
          controlsRight.start({ x: 150, transition: { duration: 0.4, ease: "easeInOut" } })
        ]);
        
        await controlsMini.start({ scale: 0.25, opacity: 1, zIndex: 30, transition: { duration: 0.4, ease: "easeOut" } });
        
        await Promise.all([
          controlsLeft.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } }),
          controlsRight.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } })
        ]);
      } else {
        await Promise.all([
          controlsLeft.start({ x: -150, transition: { duration: 0.4, ease: "easeInOut" } }),
          controlsRight.start({ x: 150, transition: { duration: 0.4, ease: "easeInOut" } })
        ]);
        
        await controlsMini.start({ scale: 0, opacity: 0, zIndex: 0, transition: { duration: 0.4, ease: "easeIn" } });
        
        await Promise.all([
          controlsLeft.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } }),
          controlsRight.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } })
        ]);
      }
    };
    
    sequence();
  }, [isHovered, controlsLeft, controlsRight, controlsMini]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#050505] text-[#050505] dark:text-[#FAFAFA] flex flex-col font-sans transition-colors duration-300">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col relative shrink-0">
        {/* Header */}
        <header className="flex justify-between items-start p-4 md:p-8">
          <div className="text-xl md:text-2xl tracking-tighter font-bold">
            We are
          </div>
          
          <div className="hidden md:flex flex-col items-start mt-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Scroll to section:</span>
            <nav className="flex space-x-6 text-[10px] font-bold tracking-widest uppercase">
              <button onClick={() => scrollToSection('about-mxe')} className="hover:opacity-70 transition-opacity uppercase font-bold text-[10px] tracking-widest">About MXE</button>
              <button onClick={() => scrollToSection('why-arcium')} className="hover:opacity-70 transition-opacity uppercase font-bold text-[10px] tracking-widest">Why Arcium</button>
              <a href="https://docs.arcium.com" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity uppercase font-bold text-[10px] tracking-widest">Arcium Docs</a>
              <button onClick={() => scrollToSection('why-confidential')} className="hover:opacity-70 transition-opacity uppercase font-bold text-[10px] tracking-widest">Why Confidential</button>
            </nav>
          </div>

          <div className="z-40 flex items-center gap-2">
            <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:scale-110 transition-transform flex items-center justify-center">
              {theme === 'dark' ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-black" />}
            </button>
            {connected ? (
              <Link 
                to="/app"
                className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold px-6 py-2 h-10 uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
              >
                Enter App
              </Link>
            ) : (
              <div className="[&_.wallet-adapter-button]:!bg-black dark:[&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-white dark:[&_.wallet-adapter-button]:!text-black [&_.wallet-adapter-button]:!text-[11px] [&_.wallet-adapter-button]:!font-bold [&_.wallet-adapter-button]:!px-6 [&_.wallet-adapter-button]:!py-2 [&_.wallet-adapter-button]:!h-10 [&_.wallet-adapter-button]:!uppercase [&_.wallet-adapter-button]:!tracking-widest [&_.wallet-adapter-button]:!rounded-full hover:[&_.wallet-adapter-button]:scale-105 [&_.wallet-adapter-button]:transition-transform">
                <WalletMultiButton />
              </div>
            )}
          </div>
        </header>

        {/* Main Center Area */}
        <main className="flex-1 flex items-center justify-center px-4 -mt-10 lg:-mt-16">
          <div 
            className="relative flex items-center justify-center cursor-crosshair select-none w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered(prev => !prev)} /* For mobile */
          >
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center text-[25vw] md:text-[20vw] leading-none font-black tracking-tighter w-full text-center"
            >
              <motion.span animate={controlsLeft} initial={{ x: 0 }} className="inline-block relative z-20">
                HU
              </motion.span>
              
              <motion.div
                 className="absolute inset-0 flex items-center justify-center pointer-events-none"
                 animate={controlsMini}
                 initial={{ scale: 0, opacity: 0, zIndex: 0 }}
              >
                <span className="text-[25vw] md:text-[20vw] text-white dark:text-black whitespace-nowrap drop-shadow-[5px_5px_0_rgba(0,0,0,1)] dark:drop-shadow-[5px_5px_0_rgba(255,255,255,1)] font-black">
                  Hush Pay
                </span>
              </motion.div>

              <motion.span animate={controlsRight} initial={{ x: 0 }} className="inline-block relative z-20">
                SH
              </motion.span>
            </motion.h1>
          </div>
        </main>

        {/* Footer Area of Hero */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end p-4 md:p-8 absolute bottom-0 left-0 right-0 gap-4">
          <div className="max-w-md text-lg md:text-3xl leading-tight font-medium tracking-tight text-center md:text-left">
            A Confidential Payroll tool shaping the paths companies take next.
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-6 md:px-16 py-24 space-y-32 text-xl md:text-3xl leading-snug font-medium tracking-tight border-t border-gray-200 dark:border-[#171717]">
        
        <section id="about-mxe" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-16">
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#737373] mb-4">About MXE</h2>
            <div className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Multi-Party<br/>Execution.
            </div>
          </div>
          <div className="flex flex-col items-start justify-end gap-6">
            <p className="text-[#525252] dark:text-[#A3A3A3] text-lg md:text-2xl">
              Arcium’s MXE network empowers applications to securely run computations over encrypted data. By distributing trust across independent nodes, Hush Pay ensures payroll data remains completely confidential—even during execution.
            </p>
            <button onClick={() => scrollToSection('why-arcium')} className="text-[10px] uppercase font-bold tracking-widest hover:opacity-70 transition-opacity flex items-center gap-2">
              Next: Why Arcium <span className="text-sm">↓</span>
            </button>
          </div>
        </section>

        <section id="why-arcium" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-16 border-t border-gray-200 dark:border-[#171717]">
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#737373] mb-4">Why Arcium</h2>
            <div className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Your Data,<br/>Your Key.
            </div>
          </div>
          <div className="flex flex-col items-start justify-end gap-6">
            <p className="text-[#525252] dark:text-[#A3A3A3] text-lg md:text-2xl">
              Salaries aren't just hidden; they are encrypted off-chain and kept entirely invisible on the blockchain. You have total sovereign control over who can reveal, compute, or modify the payroll ledger.
            </p>
            <a href="https://docs.arcium.com" target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold tracking-widest hover:opacity-70 transition-opacity flex items-center gap-2">
              Next: Arcium Docs <span className="text-sm">↗</span>
            </a>
          </div>
        </section>

        <section id="why-confidential" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-16 border-t border-gray-200 dark:border-[#171717]">
           <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#737373] mb-4">Why Confidential</h2>
            <div className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Protecting<br/>Culture.
            </div>
          </div>
          <div className="flex flex-col items-start justify-end gap-6">
            <p className="text-[#525252] dark:text-[#A3A3A3] text-lg md:text-2xl">
              Open blockchains expose everything. But in business, salary transparency without consent breeds resentment and compromises leverage. Confidential payroll lets you use crypto rails with Web2 privacy guarantees.
            </p>
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-[10px] uppercase font-bold tracking-widest hover:opacity-70 transition-opacity flex items-center gap-2">
              Back to Top <span className="text-sm">↑</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
