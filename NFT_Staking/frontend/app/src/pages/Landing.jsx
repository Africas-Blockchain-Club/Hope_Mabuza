import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useWeb3 } from "../context/Web3Context";

export default function Landing() {
  const navigate = useNavigate();
  const { stats } = useWeb3();

  useEffect(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(".l-pill",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo(".l-h1",    { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.25")
      .fromTo(".l-sub",   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
      .fromTo(".l-ctas",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
      .fromTo(".l-stats", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.1");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-10 pt-20">
      <div className="w-full max-w-4xl flex flex-col items-center">

        {/* Pill badge */}
        <div className="l-pill inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10"
          style={{
            background: "rgba(30, 50, 110, 0.6)",
            border: "1px solid rgba(100, 150, 255, 0.25)",
            backdropFilter: "blur(8px)",
          }}>
          <span className="text-sm" style={{ color: "rgba(180, 210, 255, 0.6)" }}>✦</span>
          <span className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "rgba(180, 210, 255, 0.7)", fontFamily: "DM Sans, sans-serif" }}>
            Galaxy NFT Protocol
          </span>
        </div>

        {/* Headline */}
        <h1 className="l-h1 font-bold leading-none mb-7"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(60px, 11vw, 120px)",
            letterSpacing: "-3px",
            color: "#e8eeff",
            lineHeight: 1.0,
          }}>
          Mint. Stake.<br />
          <span style={{
            background: "linear-gradient(135deg, #c0d8ff 0%, #7aaeff 40%, #5588ee 70%, #7bcfef 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Earn the Galaxy.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="l-sub text-lg leading-relaxed mb-12"
          style={{ color: "rgba(160, 190, 255, 0.5)", maxWidth: "460px", fontFamily: "DM Sans, sans-serif" }}>
          Mint your Galaxy NFT, stake it to earn GLXY rewards, and
          exchange them — all in one place.
        </p>

        {/* CTAs */}
        <div className="l-ctas flex items-center gap-4 mb-20 flex-wrap justify-center">
          <button
            className="btn-scan px-10 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, rgba(70,120,220,0.7), rgba(50,90,180,0.7))",
              border: "1px solid rgba(120,170,255,0.35)",
              color: "#d8eaff",
              fontFamily: "Syne, sans-serif",
              letterSpacing: "0.5px",
            }}
            onClick={() => navigate("/mint")}
          >
            Start minting
          </button>
          <button
            className="px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-70"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(180,210,255,0.6)",
              fontFamily: "DM Sans, sans-serif",
            }}
            onClick={() => navigate("/stake")}
          >
            View vault →
          </button>
        </div>

        {/* Stats */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { val: "$24.7M",                                              label: "Total Locked" },
            { val: stats.totalStaked ?? "2,847",                          label: "NFTs Staked" },
            { val: "142%",                                                label: "Avg APY" },
          ].map((s, i) => (
            <div key={i} className="l-stats rounded-2xl py-7 px-6"
              style={{
                background: "rgba(10, 20, 50, 0.55)",
                border: "1px solid rgba(80, 120, 220, 0.15)",
                backdropFilter: "blur(12px)",
              }}>
              <div className="font-mono text-3xl font-bold mb-2"
                style={{
                  color: "#c8d8ff",
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "-1px",
                }}>
                {s.val}
              </div>
              <div className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "rgba(120, 160, 255, 0.4)", fontFamily: "DM Sans, sans-serif" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
