import { useState } from "react";

export function useUnstake(contracts, address) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function unstake(tokenId) {
    if (!contracts.staking || !address) return false;
    setLoading(true);
    setError(null);
    try {
      // withdrawAndClaim returns the NFT and claims pending rewards in one tx
      const tx = await contracts.staking.withdrawAndClaim(tokenId);
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason ?? err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { unstake, loading, error };
}
