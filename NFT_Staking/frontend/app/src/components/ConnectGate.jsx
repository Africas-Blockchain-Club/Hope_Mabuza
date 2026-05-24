import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import WalletModal from "./WalletModal";

export default function ConnectGate({ action = "continue" }) {
  const { wallet } = useWeb3();
  const [showModal, setShowModal] = useState(false);

  if (wallet.address) return null;

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm" style={{ color: "rgba(120,160,255,0.45)", fontFamily: "DM Sans, sans-serif" }}>
          Connect your wallet to {action}
        </p>
        <button
          onClick={() => setShowModal(true)}
          disabled={wallet.connecting}
          className="btn-scan px-10 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
          style={{
            background: "rgba(60,100,200,0.35)",
            border:     "1px solid rgba(100,150,255,0.35)",
            color:      "#d0e0ff",
            fontFamily: "Syne, sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>account_balance_wallet</span>
          {wallet.connecting ? "Connecting…" : "Connect wallet"}
        </button>
      </div>

      {showModal && (
        <WalletModal
          onConnect={wallet.connect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
