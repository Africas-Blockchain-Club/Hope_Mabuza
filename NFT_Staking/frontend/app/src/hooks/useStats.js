import { useState, useEffect, useCallback } from "react";
import { Contract } from "ethers";
import { ADDRESSES } from "../constants/addresses";
import STAKING_ABI from "../abi/Staking.json";
import NFT_ABI from "../abi/NFT.json";

// Read-only stats that don't need a signer
export function useStats(provider) {
  const [stats, setStats] = useState({ totalStaked: "0", minted: "0", apy: "142" });

  const fetch = useCallback(async () => {
    if (!provider || !ADDRESSES.staking) return;
    try {
      const staking = new Contract(ADDRESSES.staking, STAKING_ABI, provider);
      const nft     = new Contract(ADDRESSES.nft,     NFT_ABI,     provider);
      const [totalStaked, minted] = await Promise.all([
        staking.totalStaked(),
        nft.nextTokenId(),
      ]);
      setStats({
        totalStaked: totalStaked.toString(),
        minted: minted.toString(),
        apy: "142",
      });
    } catch (_) {}
  }, [provider]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [fetch]);

  return stats;
}
