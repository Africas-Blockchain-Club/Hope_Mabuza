import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import WalletModal from "./WalletModal";

const TABS = [
  { to: "/mint",     label: "Mint" },
  { to: "/stake",    label: "Stake" },
  { to: "/unstake",  label: "Unstake" },
  { to: "/exchange", label: "Exchange" },
];

export default function Navbar() {
  const { wallet } = useWeb3();
  const navigate   = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          height: "58px",
          background: "rgba(6, 10, 26, 0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #4a7fd4, #2a50b0)", color: "#d8eaff", fontFamily: "Syne, sans-serif" }}>
            G
          </div>
          <span className="font-bold text-base tracking-tight"
            style={{ color: "#d8eaff", fontFamily: "Syne, sans-serif" }}>
            GalaxyStake
          </span>
        </button>

        {/* Center tabs */}
        <div className="hidden md:flex items-center gap-1">
          {TABS.map(({ to, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer select-none"
                  style={{
                    background: isActive ? "rgba(60,100,200,0.3)"          : "transparent",
                    color:      isActive ? "#c8d8ff"                        : "rgba(160,190,255,0.45)",
                    border:     isActive ? "1px solid rgba(100,150,255,0.2)": "1px solid transparent",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Wallet area */}
        <div className="flex items-center gap-2">
          {wallet.address ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(40,80,160,0.3)",
                  border:     "1px solid rgba(100,150,255,0.15)",
                  color:      "#a0c8ff",
                  fontFamily: "DM Sans, sans-serif",
                }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#4ade80" }} />
                {wallet.shortAddress}
              </div>

              <button
                onClick={wallet.disconnect}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border:     "1px solid rgba(255,255,255,0.08)",
                  color:      "rgba(160,190,255,0.45)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>logout</span>
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              disabled={wallet.connecting}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 hover:opacity-80 disabled:opacity-50"
              style={{
                background: "rgba(30,55,130,0.5)",
                border:     "1px solid rgba(100,150,255,0.2)",
                color:      "rgba(180,210,255,0.7)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {wallet.connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>

      {showModal && (
        <WalletModal
          onConnect={wallet.connect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
