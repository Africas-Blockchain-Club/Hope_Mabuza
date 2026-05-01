export default function GatePage({
  account,
  isConnected,
  error,
  connectWallet,
  isAuthorized,
  isChecking,
  accessMessage,
  accessError,
  checkAccess,
}) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 1,
      padding: "24px",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 50% 60% at 50% 50%, rgba(155,93,229,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 30% 30% at 30% 70%, rgba(232,65,122,0.07) 0%, transparent 60%)
        `,
      }} />

      {/* Gate card */}
      <div className="card-mystical" style={{
        padding: "64px 56px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
      }}>

        {/* Rose emblem */}
        <div style={{
          fontSize: "4rem",
          marginBottom: "8px",
          filter: "drop-shadow(0 0 20px rgba(232,65,122,0.8))",
          animation: "roseGlow 3s ease-in-out infinite",
        }}>🌹</div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          letterSpacing: "0.25em",
          color: "var(--gold)",
          textShadow: "0 0 20px var(--gold-glow)",
          marginBottom: "12px",
        }}>THE ENCHANTED GARDEN</h1>

        <p style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          color: "rgba(232,213,245,0.6)",
          fontSize: "1rem",
          lineHeight: 1.7,
          marginBottom: "48px",
        }}>
          This garden is sacred.<br />
          Only those who hold the Crimson Rose may enter.
        </p>

        {/* Divider */}
        <div style={{
          width: "60px", height: "1px",
          background: "linear-gradient(to right, transparent, var(--violet), transparent)",
          margin: "0 auto 40px",
        }} />

        {/* Step 1: Connect wallet */}
        {!isConnected && (
          <div>
            <p style={{
              fontFamily: "var(--font-body)",
              color: "rgba(232,213,245,0.5)",
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              marginBottom: "20px",
              textTransform: "uppercase",
            }}>Step 1 — Identify yourself</p>
            <button className="btn-neon btn-rose" onClick={connectWallet}>
              ✦ Connect Wallet
            </button>
            {error && (
              <p style={{ marginTop: "16px", color: "var(--rose)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Check access — only shown after wallet is connected */}
        {isConnected && !isAuthorized && (
          <div>
            {/* Show connected address */}
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--lily)",
              textShadow: "0 0 10px var(--lily-glow)",
              border: "1px solid rgba(126,255,212,0.2)",
              padding: "8px 16px",
              borderRadius: "2px",
              marginBottom: "32px",
              letterSpacing: "0.05em",
            }}>
              ◆ {account.slice(0, 6)}...{account.slice(-4)}
            </div>

            <p style={{
              fontFamily: "var(--font-body)",
              color: "rgba(232,213,245,0.5)",
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              marginBottom: "20px",
              textTransform: "uppercase",
            }}>Step 2 — Prove your Rose</p>

            <button
              className="btn-neon btn-gold"
              onClick={() => checkAccess(account)}
              disabled={isChecking}
            >
              {isChecking ? "Consulting the garden..." : "✦ Check Access"}
            </button>

            {/* Server denied access */}
            {accessError && (
              <div style={{ marginTop: "24px" }}>
                <p style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--rose)",
                  fontSize: "1rem",
                  marginBottom: "12px",
                }}>
                  🥀 {accessError}
                </p>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "rgba(232,213,245,0.4)",
                  fontSize: "0.9rem",
                }}>
                  You must own the Crimson Rose to enter this garden.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Granted — brief flash before App.jsx switches to HomePage */}
        {isAuthorized && (
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.9rem",
            letterSpacing: "0.2em",
            color: "var(--lily)",
            textShadow: "0 0 20px var(--lily-glow)",
          }}>
            ✦ {accessMessage} ✦
          </p>
        )}
      </div>

      <style>{`
        @keyframes roseGlow {
          0%,100% { filter: drop-shadow(0 0 20px rgba(232,65,122,0.8)); }
          50% { filter: drop-shadow(0 0 40px rgba(232,65,122,1)) drop-shadow(0 0 80px rgba(232,65,122,0.4)); }
        }
      `}</style>
    </div>
  );
}