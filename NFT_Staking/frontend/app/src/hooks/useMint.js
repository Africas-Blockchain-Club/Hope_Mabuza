import { useState } from "react";
import { parseEther } from "ethers";
import { MINT_PRICE } from "../constants/addresses";

export function useMint(contracts, address) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function mint() {
    if (!contracts.nft || !address) return;
    setLoading(true);
    setError(null);
    try {
      const tx = await contracts.nft.mint({ value: parseEther(MINT_PRICE) });
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason ?? err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { mint, loading, error };
}
