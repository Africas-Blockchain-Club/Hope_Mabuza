import { useState } from "react";
import styles from "./Panel.module.css";

export default function UnstakePanel({ stakedNFTs, cooldownOver, coolEnd, onUnstake, loading, error, address }) {
  const [selected, setSelected] = useState(null);

  const msLeft = coolEnd ? Math.max(0, coolEnd - Date.now()) : 0;
  const minsLeft = Math.ceil(msLeft / 60000);

  async function handleUnstake() {
    if (selected === null) return;
    const ok = await onUnstake(selected);
    if (ok) setSelected(null);
  }

  return (
    <div className={styles.panel} id="unstake">
      <h2 className={styles.title}>Unstake Your NFT</h2>
      <p className={styles.sub}>
        Withdraw a staked NFT. Pending rewards are automatically claimed.
      </p>

      {!cooldownOver && (
        <div className={styles.cooldownBanner}>
          🔒 Cooldown active — {minsLeft} min remaining before you can unstake.
        </div>
      )}

      {!address && <p className={styles.notice}>Connect your wallet to unstake.</p>}

      {address && stakedNFTs.length === 0 && (
        <p className={styles.notice}>No staked NFTs found.</p>
      )}

      <div className={styles.nftList}>
        {stakedNFTs.map((tokenId) => (
          <div
            key={tokenId}
            className={`${styles.nftRow} ${selected === tokenId ? styles.selected : ""}`}
            onClick={() => setSelected(tokenId)}
          >
            <div className={styles.rowArt}>🌌</div>
            <div className={styles.rowInfo}>
              <div className={styles.rowName}>Galaxy NFT #{tokenId}</div>
              <div className={styles.rowSub}>Currently staked · Earning rewards</div>
            </div>
            <span className={`${styles.rarityBadge} ${styles.legendary}`}>Staked</span>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.actionBtn}
        disabled={selected === null || loading || !address || !cooldownOver}
        onClick={handleUnstake}
      >
        {loading ? <><span className={styles.spinner} /> Unstaking…</> : "🔓 Unstake & Claim Rewards"}
      </button>
    </div>
  );
}
