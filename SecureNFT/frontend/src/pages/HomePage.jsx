import { useEffect, useRef, useState } from "react";
import WalletConnect from "../components/WalletConnect";
import ContractReader from "../components/ContractReader";
import ContractWriter from "../components/ContractWriter";

export default function HomePage({ contract, account, isConnected, error, connectWallet }) {
  const roseRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mouse parallax — rose follows cursor slightly
  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      if (roseRef.current) {
        roseRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // After a mint, increment refreshKey to force ContractReader to re-fetch
  const handleMintSuccess = () => setRefreshKey((k) => k + 1);

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(to bottom, rgba(4,2,15,0.95), transparent)",
        borderBottom: "1px solid rgba(155,93,229,0.15)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "1rem",
          letterSpacing: "0.2em", color: "var(--gold)",
          textShadow: "0 0 20px var(--gold-glow)",
        }}>✦ MY FLOWERS</div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {/* key={refreshKey} forces re-mount and re-fetch after each mint */}
          <ContractReader key={refreshKey} contract={contract} account={account} />
          <WalletConnect
            account={account}
            isConnected={isConnected}
            error={error}
            connectWallet={connectWallet}
          />
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", paddingTop: "80px",
      }}>

        {/* Background radial glows */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 50% at 50% 60%, rgba(155,93,229,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 30% 80%, rgba(0,255,204,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 70% 80%, rgba(232,65,122,0.08) 0%, transparent 60%)
          `,
        }} />

        {/* Moon */}
        <div style={{
          position: "absolute", top: "8%", right: "15%",
          width: "80px", height: "80px", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #e8f4ff, #b8d4f8)",
          boxShadow: "0 0 30px rgba(184,212,248,0.6), 0 0 60px rgba(184,212,248,0.3)",
          animation: "moonPulse 4s ease-in-out infinite",
        }} />

        {/* SVG Garden with parallax */}
        <div ref={roseRef} style={{
          width: "min(700px, 90vw)",
          transition: "transform 0.1s ease-out",
          marginBottom: "40px",
        }}>
          <svg viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", filter: "drop-shadow(0 0 40px rgba(155,93,229,0.3))" }}>
            <defs>
              <radialGradient id="roseGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff2d78" />
                <stop offset="40%" stopColor="#cc1f5a" />
                <stop offset="100%" stopColor="#7a0033" />
              </radialGradient>
              <radialGradient id="petalGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ff6ba8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8b1a4a" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="lilyGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e8f5ff" />
                <stop offset="100%" stopColor="#7effd4" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Ground mist */}
            <ellipse cx="350" cy="480" rx="320" ry="40" fill="rgba(126,255,212,0.06)" />

            {/* Stems */}
            <path d="M350 480 Q345 380 350 300" stroke="#1a5c35" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M160 480 Q155 420 160 370" stroke="#1a5c35" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M540 480 Q545 420 540 370" stroke="#1a5c35" strokeWidth="4" fill="none" strokeLinecap="round"/>

            {/* Leaves */}
            <path d="M350 400 Q310 370 290 360 Q320 385 350 400Z" fill="#1a7a40" opacity="0.8"/>
            <path d="M350 420 Q390 390 410 380 Q380 405 350 420Z" fill="#1a7a40" opacity="0.8"/>

            {/* Left Lily */}
            <g filter="url(#glow)">
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i}
                  cx={160 + Math.cos((angle*Math.PI)/180)*28}
                  cy={370 + Math.sin((angle*Math.PI)/180)*12}
                  rx="18" ry="32" fill="url(#lilyGrad)" opacity="0.85"
                  transform={`rotate(${angle}, ${160+Math.cos((angle*Math.PI)/180)*28}, ${370+Math.sin((angle*Math.PI)/180)*12})`}
                />
              ))}
              <circle cx="160" cy="370" r="10" fill="#ffd700" filter="url(#glow)"/>
              <circle cx="160" cy="370" r="5" fill="#fff"/>
            </g>

            {/* Right Lily */}
            <g filter="url(#glow)">
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i}
                  cx={540 + Math.cos((angle*Math.PI)/180)*28}
                  cy={370 + Math.sin((angle*Math.PI)/180)*12}
                  rx="18" ry="32" fill="url(#lilyGrad)" opacity="0.85"
                  transform={`rotate(${angle}, ${540+Math.cos((angle*Math.PI)/180)*28}, ${370+Math.sin((angle*Math.PI)/180)*12})`}
                />
              ))}
              <circle cx="540" cy="370" r="10" fill="#ffd700" filter="url(#glow)"/>
              <circle cx="540" cy="370" r="5" fill="#fff"/>
            </g>

            {/* Majestic Rose — center */}
            <g filter="url(#strongGlow)">
              {/* Outer petals */}
              {[0,45,90,135,180,225,270,315].map((angle, i) => (
                <ellipse key={i}
                  cx={350+Math.cos((angle*Math.PI)/180)*70}
                  cy={250+Math.sin((angle*Math.PI)/180)*55}
                  rx="45" ry="65" fill="url(#petalGrad)" opacity="0.75"
                  transform={`rotate(${angle}, ${350+Math.cos((angle*Math.PI)/180)*70}, ${250+Math.sin((angle*Math.PI)/180)*55})`}
                />
              ))}
              {/* Mid petals */}
              {[22,67,112,157,202,247,292,337].map((angle, i) => (
                <ellipse key={i}
                  cx={350+Math.cos((angle*Math.PI)/180)*42}
                  cy={250+Math.sin((angle*Math.PI)/180)*35}
                  rx="35" ry="52" fill="url(#roseGrad)" opacity="0.85"
                  transform={`rotate(${angle}, ${350+Math.cos((angle*Math.PI)/180)*42}, ${250+Math.sin((angle*Math.PI)/180)*35})`}
                />
              ))}
              {/* Inner petals */}
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i}
                  cx={350+Math.cos((angle*Math.PI)/180)*20}
                  cy={250+Math.sin((angle*Math.PI)/180)*15}
                  rx="22" ry="35" fill="#e8417a" opacity="0.9"
                  transform={`rotate(${angle}, ${350+Math.cos((angle*Math.PI)/180)*20}, ${250+Math.sin((angle*Math.PI)/180)*15})`}
                />
              ))}
              {/* Rose heart */}
              <circle cx="350" cy="250" r="22" fill="#ff1a5e"/>
              <circle cx="350" cy="250" r="12" fill="#ff6090"/>
              <circle cx="344" cy="244" r="5" fill="rgba(255,255,255,0.4)"/>
            </g>

            {/* Glow rings */}
            <circle cx="350" cy="250" r="95" fill="none" stroke="rgba(255,107,168,0.3)" strokeWidth="1"/>
            <circle cx="350" cy="250" r="108" fill="none" stroke="rgba(155,93,229,0.15)" strokeWidth="1"/>

            {/* Fireflies */}
            {[[100,200],[580,180],[200,320],[480,300],[300,150],[420,420]].map(([fx,fy],i)=>(
              <circle key={i} cx={fx} cy={fy} r="3" fill="#ffd700" filter="url(#glow)" opacity="0.8"
                style={{animation:`firefly ${2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.3}s`}}/>
            ))}
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
          letterSpacing: "0.25em", textAlign: "center", lineHeight: 1.2, marginBottom: "16px",
          background: "linear-gradient(135deg, var(--rose-glow), var(--gold), var(--lily))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          filter: "drop-shadow(0 0 20px rgba(232,65,122,0.5))",
        }}>THE ENCHANTED GARDEN</h1>

        <p style={{
          fontFamily: "var(--font-body)", fontStyle: "italic",
          fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "rgba(232,213,245,0.7)",
          letterSpacing: "0.1em", marginBottom: "60px", textAlign: "center",
        }}>Where each flower blooms eternal on the blockchain</p>

        <div style={{
          animation: "bounce 2s ease-in-out infinite",
          color: "var(--violet-light)", fontSize: "24px", opacity: 0.6,
        }}>▾</div>
      </section>

      {/* ── MINT SECTION ── */}
      <section style={{
        padding: "120px 48px", maxWidth: "900px",
        margin: "0 auto", position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 3vw, 2rem)",
            letterSpacing: "0.2em", color: "var(--gold)",
            textShadow: "0 0 20px var(--gold-glow)", marginBottom: "16px",
          }}>✦ GROW YOUR GARDEN ✦</h2>
          <p style={{
            fontFamily: "var(--font-body)", fontStyle: "italic",
            color: "rgba(232,213,245,0.6)", fontSize: "1.1rem",
          }}>
            Your Rose grants you access — now fill your garden with Lilies
          </p>
        </div>

        {/* ── NFT CARDS — lily + rose status only ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}>
          <NftCard
            emoji="🌿"
            name="The Moonlit Lily"
            desc="Delicate as starlight, each lily you mint adds to your eternal garden. No limit — fill it as you wish."
            price="0.005 ETH each"
            color="var(--lily)"
            glow="var(--lily-glow)"
            max="10,000 max supply"
          />
          <NftCard
            emoji="🌹"
            name="The Crimson Rose"
            desc="You already hold the sacred Rose. It grants you permanent access to this garden."
            price="Already yours"
            color="var(--rose)"
            glow="var(--rose-glow)"
            max="Exclusive — 1 per wallet"
          />
        </div>

        {/* ── MINT CONTROLS — lily only ── */}
        <div className="card-mystical" style={{ padding: "40px" }}>
          <p style={{
            fontFamily: "var(--font-body)", fontStyle: "italic",
            color: "rgba(232,213,245,0.5)", marginBottom: "24px", fontSize: "1rem",
          }}>
            ✦ Your Rose grants you unlimited lily minting
          </p>
          <ContractWriter
            contract={contract}
            isConnected={isConnected}
            onSuccess={handleMintSuccess}
          />
        </div>
      </section>

      {/* ── KEYFRAME ANIMATIONS ── */}
      <style>{`
        @keyframes moonPulse {
          0%,100%{box-shadow:0 0 30px rgba(184,212,248,0.6),0 0 60px rgba(184,212,248,0.3)}
          50%{box-shadow:0 0 50px rgba(184,212,248,0.9),0 0 100px rgba(184,212,248,0.5)}
        }
        @keyframes firefly {
          0%,100%{opacity:0.2;transform:translate(0,0)}
          50%{opacity:1;transform:translate(6px,-8px)}
        }
        @keyframes bounce {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(8px)}
        }
      `}</style>
    </div>
  );
}

// ── NFT INFO CARD ──
// Only used in this file so it lives here, not in its own file
function NftCard({ emoji, name, desc, price, color, glow, max }) {
  return (
    <div
      className="card-mystical"
      style={{
        padding: "32px 24px", textAlign: "center",
        transition: "transform 0.3s, box-shadow 0.3s", cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = `0 0 40px ${color}44, 0 20px 40px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{emoji}</div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontSize: "0.85rem",
        letterSpacing: "0.15em", color, textShadow: `0 0 15px ${glow}`, marginBottom: "12px",
      }}>{name}</h3>
      <p style={{
        fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "0.95rem",
        color: "rgba(232,213,245,0.65)", lineHeight: 1.6, marginBottom: "16px",
      }}>{desc}</p>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "0.75rem",
        color, letterSpacing: "0.1em", marginBottom: "6px",
      }}>{price}</div>
      <div style={{
        fontFamily: "var(--font-body)", fontSize: "0.8rem",
        color: "rgba(232,213,245,0.4)",
      }}>{max}</div>
    </div>
  );
}