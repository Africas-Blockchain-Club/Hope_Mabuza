import styles from "./Header.module.css";

export default function Header({ shortAddress, connecting, onConnect }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.gem}>✦</div>
        <span className={styles.logoText}>GalaxyStake</span>
      </div>

      <nav className={styles.nav}>
        <a href="#mint">Mint</a>
        <a href="#stake">Stake</a>
        <a href="#unstake">Unstake</a>
        <a href="#rewards">Rewards</a>
      </nav>

      <button
        className={`${styles.walletBtn} ${shortAddress ? styles.connected : ""}`}
        onClick={onConnect}
        disabled={connecting || !!shortAddress}
      >
        {shortAddress && <span className={styles.dot} />}
        {connecting ? "Connecting…" : shortAddress ?? "Connect Wallet"}
      </button>
    </header>
  );
}
