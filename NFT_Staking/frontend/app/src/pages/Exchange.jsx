import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useWeb3 } from "../context/Web3Context";
import ConnectGate from "../components/ConnectGate";

const GOAL = 100;
const syne = { fontFamily: "Syne, sans-serif" };
const dm   = { fontFamily: "DM Sans, sans-serif" };

// Galaxy NFT names cycle by total minted count
const GALAXY_NAMES = [
  "Andromeda Prime",
  "Vela Nebula",
  "Orion's Phantom",
  "Cassiopeia Drift",
  "Cygnus Deep",
  "Sculptor Void",
];

function GalaxyVisual() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(80,140,255,0.18) 0%, transparent 70%)", animation: "pulse-glow 3s ease-in-out infinite" }} />

      {/* Galaxy disc */}
      <div className="absolute rounded-full"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(ellipse at 45% 45%, rgba(160,200,255,0.55) 0%, rgba(80,130,230,0.35) 30%, rgba(30,60,160,0.2) 60%, transparent 100%)",
          transform: "rotate(-25deg)",
          filter: "blur(1px)",
          animation: "spin-slow 18s linear infinite",
        }} />

      {/* Spiral arms */}
      <div className="absolute rounded-full"
        style={{
          width: 140, height: 50,
          background: "radial-gradient(ellipse, rgba(140,190,255,0.4) 0%, transparent 70%)",
          transform: "rotate(20deg)",
          filter: "blur(6px)",
        }} />
      <div className="absolute rounded-full"
        style={{
          width: 140, height: 50,
          background: "radial-gradient(ellipse, rgba(100,160,255,0.3) 0%, transparent 70%)",
          transform: "rotate(-160deg)",
          filter: "blur(6px)",
        }} />

      {/* Bright core */}
      <div className="absolute rounded-full"
        style={{
          width: 40, height: 40,
          background: "radial-gradient(ellipse, rgba(220,235,255,0.95) 0%, rgba(160,200,255,0.6) 50%, transparent 100%)",
          filter: "blur(2px)",
          boxShadow: "0 0 24px 8px rgba(160,200,255,0.35)",
        }} />

      {/* Stars around */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 85 + Math.sin(i * 2.3) * 18;
        const x = 110 + Math.cos(angle) * r;
        const y = 110 + Math.sin(angle) * r;
        const size = 1 + Math.random() * 1.5;
        return (
          <div key={i} className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: x, top: y,
              background: "white",
              opacity: 0.4 + Math.random() * 0.5,
              animation: `twinkle-star ${2 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
            }} />
        );
      })}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(-25deg); } to { transform: rotate(335deg); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes twinkle-star { 0%,100% { opacity: 0.2; } 50% { opacity: 0.9; } }
      `}</style>
    </div>
  );
}

function CongratsScreen({ nftName, onDone }) {
  const ref = useRef();

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  return (
    <div ref={ref} className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-16 pt-24">
      <div className="w-full max-w-lg flex flex-col items-center">

        {/* Galaxy visual */}
        <div className="mb-8">
          <GalaxyVisual />
        </div>

        <p className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "rgba(120,160,255,0.6)", ...dm }}>
          Exchange complete
        </p>

        <h1 className="font-bold leading-tight mb-4"
          style={{ ...syne, fontSize: "clamp(40px, 7vw, 72px)", letterSpacing: "-2px", color: "#e8eeff" }}>
          Congratulations.
        </h1>

        <p className="text-xl font-semibold mb-3"
          style={{ color: "#c8d8ff", ...syne }}>
          {nftName}
        </p>

        <p className="text-base leading-relaxed mb-12"
          style={{ color: "rgba(160,185,255,0.5)", maxWidth: "360px", ...dm }}>
          Your Galaxy NFT has been sent to your wallet.
          You earned this — not bought it.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            className="btn-scan px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "rgba(60,100,200,0.35)", border: "1px solid rgba(100,150,255,0.35)", color: "#d0e0ff", ...syne, letterSpacing: "0.5px" }}
            onClick={onDone}
          >
            View my wallet
          </button>
          <button
            className="text-sm font-medium transition-opacity hover:opacity-60"
            style={{ color: "rgba(160,185,255,0.45)", ...dm }}
            onClick={onDone}
          >
            Back to exchange →
          </button>
        </div>

      </div>
    </div>
  );
}

export default function Exchange() {
  const { rewards, wallet, stats } = useWeb3();
  const navigate  = useNavigate();
  const barRef    = useRef();
  const [exchanged, setExchanged]       = useState(false);
  const [nftName,   setNftName]         = useState("");
  const [attempting, setAttempting]     = useState(false);

  const walletBal  = parseFloat(rewards.balance || 0);
  const pending    = parseFloat(rewards.pending  || 0);
  const total      = walletBal + pending;
  const progress   = Math.min(100, (total / GOAL) * 100);
  const canExchange = walletBal >= GOAL;

  // Detect successful exchange: attempting was true, loading finished, no error
  useEffect(() => {
    if (attempting && !rewards.loading && !rewards.error) {
      const idx  = (stats?.minted ?? 0) % GALAXY_NAMES.length;
      setNftName(GALAXY_NAMES[idx]);
      setExchanged(true);
      setAttempting(false);
    }
  }, [rewards.loading, rewards.error, attempting]);

  useEffect(() => {
    if (!exchanged) {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".ex-label", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 })
        .fromTo(".ex-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
        .fromTo(".ex-desc",  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
        .fromTo(".ex-body",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    }
  }, [exchanged]);

  useEffect(() => {
    if (barRef.current)
      gsap.to(barRef.current, { width: `${progress}%`, duration: 1.2, ease: "power2.out" });
  }, [progress]);

  async function handleExchange() {
    setAttempting(true);
    await rewards.claim();
  }

  if (exchanged) {
    return <CongratsScreen nftName={nftName} onDone={() => setExchanged(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-16 pt-24">
      <div className="w-full max-w-2xl">

        <p className="ex-label text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "rgba(120,160,255,0.7)", ...dm }}>
          Exchange · GLXY → Galaxy NFT
        </p>

        <h1 className="ex-title font-bold leading-none mb-8"
          style={{ ...syne, fontSize: "clamp(46px, 8.5vw, 90px)", letterSpacing: "-2.5px", color: "#e8eeff" }}>
          Turn rewards into<br />
          <span style={{ background: "linear-gradient(135deg, #a8c8ff, #6090e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            something rare.
          </span>
        </h1>

        <p className="ex-desc text-lg leading-relaxed mb-12 mx-auto"
          style={{ color: "rgba(160,185,255,0.55)", maxWidth: "460px", ...dm }}>
          Accumulate 100 GLXY by{" "}
          <button onClick={() => navigate("/stake")}
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "rgba(180,210,255,0.85)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            staking your NFT
          </button>
          , then exchange them here for a Galaxy NFT — a rare collectible you earn, not buy.
        </p>

        {!wallet.address ? <ConnectGate action="exchange rewards" /> : (
          <div className="ex-body w-full">

            {/* Balances */}
            <div className="flex items-end justify-center gap-8 mb-12 flex-wrap">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="font-mono font-bold"
                    style={{ fontSize: "52px", color: "#c8d8ff", lineHeight: 1, fontFamily: "JetBrains Mono, monospace" }}>
                    {walletBal.toFixed(3)}
                  </span>
                  <span className="text-xl" style={{ color: "rgba(120,160,255,0.45)", ...dm }}>GLXY</span>
                </div>
                <p className="text-xs" style={{ color: "rgba(120,160,255,0.35)", ...dm }}>In wallet</p>
              </div>

              {pending > 0 && (
                <>
                  <span className="text-2xl mb-4" style={{ color: "rgba(120,160,255,0.2)" }}>+</span>
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="font-mono font-bold"
                        style={{ fontSize: "52px", color: "rgba(180,210,255,0.5)", lineHeight: 1, fontFamily: "JetBrains Mono, monospace" }}>
                        {pending.toFixed(3)}
                      </span>
                      <span className="text-xl" style={{ color: "rgba(120,160,255,0.3)", ...dm }}>GLXY</span>
                    </div>
                    <p className="text-xs flex items-center justify-center gap-1.5"
                      style={{ color: "rgba(80,200,120,0.7)", ...dm }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                        style={{ background: "rgba(80,200,120,0.8)" }} />
                      Pending (staked)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="mb-10 mx-auto w-full max-w-sm">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(120,160,255,0.35)", ...dm }}>Progress to Galaxy NFT</span>
                <span className="font-mono text-sm"
                  style={{ color: "#c8d8ff", fontFamily: "JetBrains Mono, monospace" }}>
                  {total.toFixed(1)} / {GOAL}
                </span>
              </div>
              <div className="w-full rounded-full" style={{ height: "2px", background: "rgba(255,255,255,0.07)" }}>
                <div ref={barRef} className="h-full rounded-full" style={{
                  width: "0%",
                  background: progress >= 100
                    ? "linear-gradient(90deg, #a8c8ff, #6090e0)"
                    : "rgba(100,150,255,0.55)",
                }} />
              </div>
              {canExchange && (
                <p className="text-sm mt-3" style={{ color: "rgba(130,200,130,0.8)", ...dm }}>
                  You have enough GLXY — ready to exchange.
                </p>
              )}
            </div>

            {/* Info rows */}
            <div className="flex flex-col items-center gap-3 mb-12">
              {[
                ["Rate",        "100 GLXY = 1 Galaxy NFT"],
                ["Wallet",      `${walletBal.toFixed(3)} GLXY`],
                ["Pending",     pending > 0 ? `${pending.toFixed(3)} GLXY` : "—"],
                ["Reward rate", "~1 GLXY / NFT / min"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-4">
                  <span className="text-xs"
                    style={{ color: "rgba(120,160,255,0.35)", minWidth: "80px", textAlign: "right", ...dm }}>{k}</span>
                  <span className="text-sm" style={{ color: "rgba(180,200,255,0.6)", ...dm }}>{v}</span>
                </div>
              ))}
            </div>

            {rewards.error && (
              <p className="text-sm mb-4" style={{ color: "#f87171", ...dm }}>{rewards.error}</p>
            )}

            <div className="flex flex-col items-center gap-3">
              {pending > 0 && !canExchange && (
                <button
                  className="btn-scan px-12 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={rewards.loading || !rewards.cooldownOver}
                  style={{ background: "rgba(60,100,200,0.35)", border: "1px solid rgba(100,150,255,0.35)", color: "#d0e0ff", ...syne, letterSpacing: "0.5px" }}
                  onClick={rewards.claim}
                >
                  Claim pending GLXY
                </button>
              )}

              <button
                className="btn-scan px-12 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                disabled={rewards.loading || !canExchange}
                style={{ background: "rgba(60,100,200,0.35)", border: "1px solid rgba(100,150,255,0.35)", color: "#d0e0ff", ...syne, letterSpacing: "0.5px" }}
                onClick={handleExchange}
              >
                {rewards.loading && attempting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Exchanging…
                  </span>
                ) : canExchange
                  ? "Exchange for Galaxy NFT"
                  : `${Math.max(0, GOAL - total).toFixed(1)} GLXY to go`}
              </button>
            </div>

            <p className="text-xs mt-4" style={{ color: "rgba(120,160,255,0.3)", ...dm }}>
              Galaxy NFT sent directly to your wallet
            </p>

          </div>
        )}
      </div>
    </div>
  );
}
