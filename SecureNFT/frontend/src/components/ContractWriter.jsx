import { useState } from "react";
import { ethers } from "ethers";

// Rose owners only reach this component — so we only show lily minting
export default function ContractWriter({ contract, isConnected, onSuccess }) {
  const [lilyAmount, setLilyAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  async function mintLily() {
    if (!contract || !isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      // mintLily(amount) is payable — 0.005 ETH per lily
      const price = ethers.parseEther("0.005") * BigInt(lilyAmount);
      const tx = await contract.mintLily(lilyAmount, { value: price });

      setTxHash(tx.hash);
      await tx.wait();

      // Tell HomePage to refresh the balance display
      if (onSuccess) onSuccess();

    } catch (err) {
      if (err.code === "ACTION_REJECTED") setError("Transaction rejected in MetaMask.");
      else if (err.code === "INSUFFICIENT_FUNDS") setError("Not enough ETH for gas.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Lily amount selector */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontFamily: "var(--font-body)", color: "var(--lily)", fontSize: "16px" }}>
          How many Lilies?
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3, 5, 10].map((n) => (
            <button key={n} onClick={() => setLilyAmount(n)} style={{
              background: lilyAmount === n ? "var(--lily)" : "transparent",
              color: lilyAmount === n ? "var(--night)" : "var(--lily)",
              border: "1px solid var(--lily)",
              borderRadius: "2px", width: "36px", height: "36px",
              cursor: "pointer", fontFamily: "var(--font-body)",
              fontSize: "16px", transition: "all 0.2s",
            }}>{n}</button>
          ))}
        </div>
      </div>

      <button
        className="btn-neon btn-lily"
        onClick={mintLily}
        disabled={loading || !isConnected}
      >
        {loading ? "Minting..." : `✦ Mint ${lilyAmount} Lily — ${(0.005 * lilyAmount).toFixed(3)} ETH`}
      </button>

      {txHash && (
        <p style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--gold)", fontSize: "14px" }}>
          ✦ Transaction sent —{" "}
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
            style={{ color: "var(--gold)", textDecoration: "underline" }}>
            View on Etherscan
          </a>
        </p>
      )}
      {error && (
        <p style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--rose)", fontSize: "14px" }}>
          {error}
        </p>
      )}
    </div>
  );
}