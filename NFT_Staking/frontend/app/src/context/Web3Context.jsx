import { createContext, useContext, useState, useCallback } from "react";
import { useWallet }    from "../hooks/useWallet";
import { useContracts } from "../hooks/useContracts";
import { useNFTs }      from "../hooks/useNFTs";
import { useMint }      from "../hooks/useMint";
import { useStake }     from "../hooks/useStake";
import { useUnstake }   from "../hooks/useUnstake";
import { useRewards }   from "../hooks/useRewards";
import { useStats }     from "../hooks/useStats";

const Ctx = createContext(null);

export function Web3Provider({ children }) {
  const [toast, setToast] = useState(null);

  const wallet    = useWallet();
  const contracts = useContracts(wallet.signer);
  const stats     = useStats(wallet.provider);
  const nfts      = useNFTs(contracts, wallet.address);
  const mint      = useMint(contracts, wallet.address);
  const stake     = useStake(contracts, wallet.address);
  const unstake   = useUnstake(contracts, wallet.address);
  const rewards   = useRewards(contracts, wallet.address);

  const showToast = useCallback((icon, title, desc) => {
    setToast({ icon, title, desc });
    setTimeout(() => setToast(null), 3800);
  }, []);

  async function handleMint() {
    const ok = await mint.mint();
    if (ok) { nfts.refresh(); showToast("🌌", "NFT Minted!", "Your Galaxy NFT is in your wallet."); }
    return ok;
  }

  async function handleStake(tokenId) {
    const ok = await stake.stake(tokenId);
    if (ok) { nfts.refresh(); showToast("⚡", "NFT Staked!", "Earning GLXY rewards every minute."); }
    return ok;
  }

  async function handleUnstake(tokenId) {
    const ok = await unstake.unstake(tokenId);
    if (ok) { nfts.refresh(); rewards.refresh(); showToast("🔓", "Unstaked!", "NFT returned and rewards claimed."); }
    return ok;
  }

  async function handleClaim() {
    const ok = await rewards.claim();
    if (ok) { rewards.refresh(); showToast("✦", "Rewards Claimed!", "GLXY tokens sent to your wallet."); }
    return ok;
  }

  return (
    <Ctx.Provider value={{
      wallet, contracts, stats, nfts,
      mint:    { ...mint,    execute: handleMint },
      stake:   { ...stake,   execute: handleStake },
      unstake: { ...unstake, execute: handleUnstake },
      rewards: { ...rewards, claim: handleClaim },
      toast, showToast,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWeb3 = () => useContext(Ctx);
