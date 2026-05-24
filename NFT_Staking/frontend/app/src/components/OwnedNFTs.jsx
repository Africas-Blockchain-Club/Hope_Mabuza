import styles from "./OwnedNFTs.module.css";

const ART_BG = {
  Legendary: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(124,58,237,0.2))",
  Epic:      "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(30,58,232,0.15))",
  Rare:      "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(6,182,212,0.12))",
};

export default function OwnedNFTs({ walletNFTs, stakedNFTs }) {
  const all = [
    ...stakedNFTs.map((id) => ({ id, staked: true })),
    ...walletNFTs.map((id) => ({ id, staked: false })),
  ];

  if (all.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.label}>
        Your NFTs
        <span className={styles.labelLine} />
      </div>
      <div className={styles.grid}>
        {all.map(({ id, staked }) => (
          <div key={id} className={styles.card}>
            <div className={styles.art} style={{ background: ART_BG.Rare }}>
              🌌
            </div>
            <div className={styles.body}>
              <div className={styles.name}>Galaxy NFT #{id}</div>
              <div className={styles.meta}>ERC-721 · Token #{id}</div>
              <span className={staked ? styles.badgeStaked : styles.badgeIdle}>
                {staked ? "● Staked" : "○ In Wallet"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
