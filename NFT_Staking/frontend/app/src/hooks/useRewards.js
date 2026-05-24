import { useState, useEffect, useCallback } from "react";
import { formatEther } from "ethers";

export function useRewards(contracts, address) {
  const [pending,  setPending]  = useState("0.000");
  const [balance,  setBalance]  = useState("0.000");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [coolEnd,  setCoolEnd]  = useState(null); // timestamp when cooldown expires

  const refresh = useCallback(async () => {
    if (!contracts.staking || !contracts.token || !address) return;
    try {
      const [raw, bal, info, cool] = await Promise.all([
        contracts.staking.calculateRewards(address),
        contracts.token.balanceOf(address),
        contracts.staking.userInfo(address),
        contracts.staking.coolTime(),
      ]);
      setPending(parseFloat(formatEther(raw)).toFixed(3));
      setBalance(parseFloat(formatEther(bal)).toFixed(3));
      const stakedAt = Number(info.stakedAt);
      if (stakedAt > 0) {
        setCoolEnd((stakedAt + Number(cool)) * 1000); // ms
      }
    } catch (_) {}
  }, [contracts, address]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [refresh]);

  async function claim() {
    if (!contracts.staking || !address) return false;
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.staking.claimRewards();
      await tx.wait();
      await refresh();
      return true;
    } catch (err) {
      setError(err.reason ?? err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Whether the user is past the 5-minute cooldown
  const cooldownOver = coolEnd ? Date.now() >= coolEnd : true;

  return { pending, balance, loading, error, coolEnd, cooldownOver, claim, refresh };
}
