import { useState } from "react";
import styles from "./Panel.module.css";

export default function StakePanel({ walletNFTs, onStake, loading, error, address }) {
  const [selected, setSelected] = useState(null);

  async function handleStake() {
    if (selected === null) return;
    const ok = await onStake(selected);
    if (ok) setSelected(null);
  }

  return (
    <div className={styles.panel} id="stake">
      <h2 className={styles.title}>Stake Your NFT</h2>
      <p className={styles.sub}>
        Lock an NFT into the vault to start earning GLXY rewards every minute.
      </p>

      {!address && <p className={styles.notice}>Connect your wallet to stake.</p>}

      {address && walletNFTs.length === 0 && (
        <p className={styles.notice}>No unstaked NFTs in your wallet. Mint one first.</p>
      )}

      <div className={styles.nftList}>
        {walletNFTs.map((tokenId) => (
          <div
            key={tokenId}
            className={`${styles.nftRow} ${selected === tokenId ? styles.selected : ""}`}
            onClick={() => setSelected(tokenId)}
          >
            <div className={styles.rowArt}>🌌</div>
            <div className={styles.rowInfo}>
              <div className={styles.rowName}>Galaxy NFT #{tokenId}</div>
              <div className={styles.rowSub}>In wallet · Ready to stake</div>
            </div>
            <div className={styles.rowApy}>142%</div>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.actionBtn}
        disabled={selected === null || loading || !address}
        onClick={handleStake}
      >
        {loading ? <><span className={styles.spinner} /> Staking…</> : "⚡ Stake Selected NFT"}
      </button>
    </div>
  );
}
