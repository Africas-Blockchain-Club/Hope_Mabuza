import { useState, useCallback } from "react";

export function useNFTGate(account) {
  const [hasAccess, setHasAccess] = useState(null);

  const checkAccess = useCallback(async () => {
    if (!account) return;
    const res = await fetch("http://localhost:3000/verify-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: account }),
    });
    const data = await res.json();
    setHasAccess(data.authorized === true);
  }, [account]);

  return { hasAccess, checkAccess };
}
