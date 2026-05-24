import { useState, useEffect, useCallback } from "react";
import { ADDRESSES } from "../constants/addresses";

// Builds the user's NFT inventory: which tokens they own and which are staked
export function useNFTs(contracts, address) {
  const [walletNFTs,  setWalletNFTs]  = useState([]); // token ids in wallet
  const [stakedNFTs,  setStakedNFTs]  = useState([]); // token ids staked
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!contracts.nft || !contracts.staking || !address) return;
    setLoading(true);
    try {
      const totalSupply = Number(await contracts.nft.totalSupply());
      const stakedIds   = (await contracts.staking.getStakedTokenIds(address)).map(Number);

      // Check ownership for each token id (supply is max 14)
      const owned = [];
      for (let id = 0; id < totalSupply; id++) {
        try {
          const owner = await contracts.nft.ownerOf(id);
          if (owner.toLowerCase() === address.toLowerCase()) {
            owned.push(id);
          }
        } catch (_) {}
      }

      setWalletNFTs(owned);
      setStakedNFTs(stakedIds);
    } catch (_) {}
    finally { setLoading(false); }
  }, [contracts, address]);

  useEffect(() => { refresh(); }, [refresh]);

  return { walletNFTs, stakedNFTs, loading, refresh };
}
