import styles from "./Panel.module.css";

// 1 GLXY ≈ 0.0003 ETH (display only — no on-chain DEX in scope)
const RATE = 0.0003;

export default function RewardsPanel({ pending, balance, cooldownOver, coolEnd, onClaim, loading, error, address }) {
  const ethEquiv = (parseFloat(pending) * RATE).toFixed(4);

  const msLeft = coolEnd ? Math.max(0, coolEnd - Date.now()) : 0;
  const minsLeft = Math.ceil(msLeft / 60000);

  return (
    <div className={styles.panel} id="rewards">
      <h2 className={styles.title}>Rewards</h2>
      <p className={styles.sub}>
        Claim your accumulated GLXY rewards. Rate: ~1 GLXY per NFT per minute.
      </p>

      {!cooldownOver && (
        <div className={styles.cooldownBanner}>
          🔒 Cooldown active — {minsLeft} min remaining before you can claim.
        </div>
      )}

      <div className={styles.exchangeBox}>
        <div className={styles.exLabel}>Pending rewards</div>
        <div className={styles.exAmount}>{pending}</div>
        <div className={styles.exToken}>GLXY — Galaxy Token</div>
      </div>

      <div className={styles.exArrow}>↕</div>

      <div className={styles.exchangeBox}>
        <div className={styles.exLabel}>ETH equivalent (est.)</div>
        <div className={styles.exAmount}>{ethEquiv}</div>
        <div className={styles.exToken}>ETH — Ethereum</div>
      </div>

      <div className={styles.exRate}>
        <span>Exchange rate</span>
        <span>1 GLXY = {RATE} ETH</span>
      </div>
      <div className={styles.exRate} style={{ borderTop: "none", paddingTop: 0, marginTop: 4 }}>
        <span>Wallet balance</span>
        <span>{balance} GLXY</span>
      </div>

      {!address && <p className={styles.notice}>Connect your wallet to claim.</p>}
      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.actionBtn}
        disabled={loading || !address || parseFloat(pending) === 0 || !cooldownOver}
        onClick={onClaim}
      >
        {loading ? <><span className={styles.spinner} /> Claiming…</> : "✦ Claim GLXY Rewards"}
      </button>
    </div>
  );
}
