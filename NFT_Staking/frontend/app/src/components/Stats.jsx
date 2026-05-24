import styles from "./Stats.module.css";

export default function Stats({ totalStaked, minted, apy }) {
  return (
    <div className={styles.stats}>
      <div className={styles.card}>
        <div className={styles.val}>${(24.7).toFixed(1)}M</div>
        <div className={styles.lbl}>Total Locked</div>
      </div>
      <div className={styles.card}>
        <div className={styles.val}>{totalStaked}</div>
        <div className={styles.lbl}>NFTs Staked</div>
      </div>
      <div className={styles.card}>
        <div className={styles.val}>{apy}%</div>
        <div className={styles.lbl}>Avg APY</div>
      </div>
    </div>
  );
}
