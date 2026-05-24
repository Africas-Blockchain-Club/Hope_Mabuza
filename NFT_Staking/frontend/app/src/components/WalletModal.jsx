import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const syne = { fontFamily: "Syne, sans-serif" };
const dm   = { fontFamily: "DM Sans, sans-serif" };

const WALLETS = [
  {
    id:   "metamask",
    name: "MetaMask",
    desc: "Connect using your MetaMask browser extension",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
        <path d="M36.2 3L22.3 13.1l2.6-6L36.2 3z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.8 3l13.8 10.2-2.5-6.1L3.8 3z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M31 26.8l-3.7 5.7 7.9 2.2 2.3-7.7-6.5-.2zM2.5 27l2.2 7.7 7.9-2.2-3.7-5.7-6.4.2z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.2 17.8l-2.2 3.3 7.8.4-.3-8.4-5.3 4.7zM27.8 17.8l-5.4-4.8-.2 8.5 7.8-.4-2.2-3.3zM12.6 32.5l4.7-2.3-4-3.1-.7 5.4zM22.7 30.2l4.7 2.3-.8-5.4-3.9 3.1z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M27.4 32.5l-4.7-2.3.4 3.2-.1 2.9 4.4-5.8zM12.6 32.5l4.4 5.8-.1-2.9.4-3.2-4.7 2.3z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.1 24.8l-3.9-1.1 2.7-1.3 1.2 2.4zM22.9 24.8l1.2-2.4 2.8 1.3-4 1.1z" fill="#233447" stroke="#233447" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.6 32.5l.7-5.7-4.5.2 3.8 5.5zM26.7 26.8l.7 5.7 3.8-5.5-4.5-.2zM30.1 21.1l-7.8.4.7 4.1 1.2-2.4 2.8 1.3 3.1-3.4zM13.2 23.7l2.7 1.3 1.2-2.4.8 4.1-7.8-.4 3.1-5zM17.1 24.8l-.8-4.5 3.7.1-.3 4.4h-2.6zM22.9 24.8h-2.6l-.2-4.4 3.7-.1-.9 4.5z" fill="#CC6228" stroke="#CC6228" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    available: () => typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
  },
  {
    id:   "coinbase",
    name: "Coinbase Wallet",
    desc: "Connect using Coinbase Wallet",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
        <rect width="40" height="40" rx="12" fill="#0052FF"/>
        <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 18.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z" fill="white"/>
        <rect x="16.5" y="17" width="7" height="6" rx="1.5" fill="white"/>
      </svg>
    ),
    available: () => typeof window !== "undefined" && !!window.ethereum?.isCoinbaseWallet,
  },
  {
    id:   "browser",
    name: "Browser Wallet",
    desc: "Any injected wallet (Brave, Frame, etc.)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
        <rect width="40" height="40" rx="12" fill="rgba(80,130,220,0.2)" stroke="rgba(100,150,255,0.3)" strokeWidth="1"/>
        <circle cx="20" cy="20" r="9" stroke="rgba(160,200,255,0.6)" strokeWidth="1.5" fill="none"/>
        <path d="M20 11v18M11 20h18M13.5 13.5c2 2.5 4 5 6.5 6.5M26.5 13.5c-2 2.5-4 5-6.5 6.5M13.5 26.5c2-2.5 4-5 6.5-6.5M26.5 26.5c-2-2.5-4-5-6.5-6.5" stroke="rgba(160,200,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    available: () => typeof window !== "undefined" && !!window.ethereum,
  },
];

export default function WalletModal({ onConnect, onClose }) {
  const overlayRef = useRef();
  const panelRef   = useRef();

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(panelRef.current,   { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" });
  }, []);

  function close() {
    gsap.to(panelRef.current,   { opacity: 0, y: 16, scale: 0.97, duration: 0.2 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  }

  function handleSelect(wallet) {
    if (!wallet.available()) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    onConnect();
    close();
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(4,8,20,0.75)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === overlayRef.current && close()}>

      <div ref={panelRef} className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#0e1528", border: "1px solid rgba(100,150,255,0.15)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="text-base font-bold mb-0.5" style={{ color: "#e8eeff", ...syne }}>Connect Wallet</h2>
            <p className="text-xs" style={{ color: "rgba(120,160,255,0.45)", ...dm }}>Choose how you want to connect</p>
          </div>
          <button onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(160,190,255,0.5)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
          </button>
        </div>

        {/* Wallet list */}
        <div className="p-3 flex flex-col gap-1.5">
          {WALLETS.map(wallet => {
            const isAvailable = wallet.available();
            return (
              <button key={wallet.id}
                onClick={() => handleSelect(wallet)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-150 group w-full"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(80,130,220,0.08)";
                  e.currentTarget.style.borderColor = "rgba(100,150,255,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                }}
              >
                <div className="flex-shrink-0">{wallet.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold mb-0.5" style={{ color: "#c8d8ff", ...syne }}>{wallet.name}</div>
                  <div className="text-xs" style={{ color: "rgba(120,160,255,0.4)", ...dm }}>
                    {isAvailable ? wallet.desc : "Not installed — click to install"}
                  </div>
                </div>
                <span className="material-symbols-outlined flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                  style={{ fontSize: "16px", color: isAvailable ? "rgba(120,160,255,0.4)" : "rgba(120,160,255,0.2)" }}>
                  {isAvailable ? "arrow_forward" : "open_in_new"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-xs text-center" style={{ color: "rgba(120,160,255,0.3)", ...dm }}>
            By connecting you agree to the terms of the Galaxy protocol
          </p>
        </div>
      </div>
    </div>
  );
}
