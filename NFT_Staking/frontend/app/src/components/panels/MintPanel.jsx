import { useState } from "react";
import styles from "./Panel.module.css";

const NFT_TYPES = [
  { icon: "🌌", name: "Nebula Warden", rarity: "Legendary", rarityClass: "legendary", apy: "180%", price: "0.0001 ETH" },
  { icon: "🪐", name: "Void Titan",    rarity: "Epic",      rarityClass: "epic",      apy: "165%", price: "0.0001 ETH" },
  { icon: "⭐", name: "Star Phantom",  rarity: "Rare",      rarityClass: "rare",      apy: "142%", price: "0.0001 ETH" },
];

export default function MintPanel({ onMint, loading, error, address }) {
  const [selected, setSelected] = useState(null);

  async function handleMint() {
    if (!address) return;
    const ok = await onMint();
    if (ok) setSelected(null);
  }

  return (
    <div className={styles.panel} id="mint">
      <h2 className={styles.title}>Mint a Galaxy NFT</h2>
      <p className={styles.sub}>
        Choose your NFT. Each gives unique staking APY. Mint fee: 0.0001 ETH.
      </p>

      <div className={styles.mintGrid}>
        {NFT_TYPES.map((nft, i) => (
          <div
            key={i}
            className={`${styles.nftOption} ${selected === i ? styles.selected : ""}`}
            onClick={() => setSelected(i)}
          >
            {selected === i && <div className={styles.check}>✓</div>}
            <div className={styles.art}>{nft.icon}</div>
            <div className={styles.nftName}>{nft.name}</div>
            <span className={`${styles.rarityBadge} ${styles[nft.rarityClass]}`}>{nft.rarity}</span>
            <div className={styles.nftApy}>{nft.apy} APY</div>
            <div className={styles.nftPrice}>{nft.price}</div>
          </div>
        ))}
      </div>

      {!address && (
        <p className={styles.notice}>Connect your wallet to mint.</p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.actionBtn}
        disabled={selected === null || loading || !address}
        onClick={handleMint}
      >
        {loading ? <><span className={styles.spinner} /> Minting…</> : "✦ Mint Selected NFT"}
      </button>
    </div>
  );
}
