import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useWeb3 } from "../context/Web3Context";
import ConnectGate from "../components/ConnectGate";

const syne = { fontFamily: "Syne, sans-serif" };
const dm   = { fontFamily: "DM Sans, sans-serif" };

export default function Mint() {
  const { mint, wallet, stats } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(".m-label",  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 })
      .fromTo(".m-title",  { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
      .fromTo(".m-desc",   { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
      .fromTo(".m-meta",   { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
      .fromTo(".m-banner", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.1")
      .fromTo(".m-action", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.1");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-16 pt-24">
      <div className="w-full max-w-2xl">

        <p className="m-label text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "rgba(120,160,255,0.7)", ...dm }}>
          Member NFT · 0.0001 ETH
        </p>

        <h1 className="m-title font-bold leading-none mb-8"
          style={{
            ...syne,
            fontSize: "clamp(50px, 9vw, 96px)",
            letterSpacing: "-2.5px",
            color: "#e8eeff",
          }}>
          Your pass into<br />
          <span style={{
            background: "linear-gradient(135deg, #a8c8ff, #6090e0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            the Galaxy.
          </span>
        </h1>

        <p className="m-desc text-lg leading-relaxed mb-10 mx-auto"
          style={{ color: "rgba(160,185,255,0.55)", maxWidth: "440px", ...dm }}>
          Mint a Galaxy Member NFT to join the protocol. It's your starting point —
          stake it, earn rewards, and work your way toward something rare.
        </p>

        {/* Meta */}
        <div className="m-meta flex items-center justify-center gap-10 mb-12">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold mb-1" style={{ color: "#c8d8ff" }}>0.0001 ETH</div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(120,160,255,0.4)", ...dm }}>Mint price</div>
          </div>
          <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.07)" }} />
          <div className="text-center">
            <div className="font-mono text-2xl font-bold mb-1" style={{ color: "#c8d8ff" }}>
              {stats?.minted ?? "—"} / 14
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(120,160,255,0.4)", ...dm }}>Minted</div>
          </div>
        </div>

        {/* Journey */}
        <p className="m-banner text-base leading-loose mb-12 mx-auto"
          style={{ color: "rgba(160,185,255,0.5)", maxWidth: "440px", ...dm }}>
          Once minted,{" "}
          <button onClick={() => navigate("/stake")}
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "rgba(180,210,255,0.85)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            stake your NFT
          </button>{" "}
          to earn GLXY every minute. Reach{" "}
          <span style={{ color: "#c8d8ff", fontWeight: 600 }}>100 GLXY</span> and{" "}
          <button onClick={() => navigate("/exchange")}
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "rgba(180,210,255,0.85)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            exchange them for a Galaxy NFT
          </button>{" "}
          — earned, not bought.
        </p>

        {/* Action */}
        <div className="m-action flex flex-col items-center gap-3">
          {!wallet.address ? (
            <ConnectGate action="mint" />
          ) : (
            <>
              {mint.error && (
                <p className="text-sm mb-1" style={{ color: "#f87171", ...dm }}>{mint.error}</p>
              )}
              <button
                className="btn-scan px-12 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                disabled={mint.loading}
                style={{ background: "rgba(60,100,200,0.35)", border: "1px solid rgba(100,150,255,0.35)", color: "#d0e0ff", ...syne, letterSpacing: "0.5px" }}
                onClick={mint.execute}
              >
                {mint.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Minting…
                  </span>
                ) : "Mint your NFT"}
              </button>
              <p className="text-xs" style={{ color: "rgba(120,160,255,0.35)", ...dm }}>
                One per wallet · Shows in your wallet instantly
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
