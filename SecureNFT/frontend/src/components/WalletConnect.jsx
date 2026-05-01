export default function WalletConnect({ account, isConnected, error, connectWallet }) {
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {error && (
        <span style={{ color: "var(--rose)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
          {error}
        </span>
      )}
      {!isConnected ? (
        <button className="btn-neon btn-rose" onClick={connectWallet}>
          ✦ Connect Wallet
        </button>
      ) : (
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--lily)",
          border: "1px solid rgba(126,255,212,0.3)",
          padding: "8px 16px",
          borderRadius: "2px",
          letterSpacing: "0.05em",
          textShadow: "0 0 10px var(--lily-glow)",
        }}>
          ◆ {shortAddress}
        </div>
      )}
    </div>
  );
}