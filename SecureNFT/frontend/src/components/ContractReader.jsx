import { useState, useEffect } from "react";

// Shows only Lily balance — Rose owners already know they have a Rose
export default function ContractReader({ contract, account }) {
  const [lilyBalance, setLilyBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchBalance() {
    if (!contract || !account) return;
    try {
      setIsLoading(true);
      // Token ID 1 = LILY
      const lily = await contract.balanceOf(account, 1);
      setLilyBalance(lily.toString());
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchBalance(); }, [contract, account]);

  if (!account) return null;

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      {isLoading ? (
        <span style={{ color: "var(--violet-light)", fontSize: "13px" }}>...</span>
      ) : (
        <div style={{
          fontFamily: "var(--font-body)", fontSize: "14px",
          color: "var(--lily)", textShadow: "0 0 8px var(--lily-glow)",
          border: "1px solid rgba(126,255,212,0.25)",
          padding: "6px 12px", borderRadius: "2px", letterSpacing: "0.05em",
        }}>
          🌿 {lilyBalance ?? "—"} Lilies
        </div>
      )}
      <button onClick={fetchBalance} style={{
        background: "none", border: "none", color: "var(--violet-light)",
        cursor: "pointer", fontSize: "12px", opacity: 0.7,
      }}>↻</button>
    </div>
  );
}