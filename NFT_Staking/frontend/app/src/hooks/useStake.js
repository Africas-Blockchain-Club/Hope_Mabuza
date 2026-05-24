import { useState } from "react";
import { ADDRESSES } from "../constants/addresses";

export function useStake(contracts, address) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function stake(tokenId) {
    if (!contracts.nft || !contracts.staking || !address) return false;
    setLoading(true);
    setError(null);
    try {
      // Approve staking contract to transfer the NFT if not already approved
      const approved = await contracts.nft.isApprovedForAll(address, ADDRESSES.staking);
      if (!approved) {
        const approveTx = await contracts.nft.setApprovalForAll(ADDRESSES.staking, true);
        await approveTx.wait();
      }
      const tx = await contracts.staking.stake(tokenId);
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason ?? err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { stake, loading, error };
}
