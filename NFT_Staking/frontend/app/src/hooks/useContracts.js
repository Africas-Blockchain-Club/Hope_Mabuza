import { useMemo } from "react";
import { Contract } from "ethers";
import { ADDRESSES } from "../constants/addresses";
import NFT_ABI from "../abi/NFT.json";
import STAKING_ABI from "../abi/Staking.json";
import TOKEN_ABI from "../abi/RewardToken.json";

export function useContracts(signer) {
  return useMemo(() => {
    if (!signer) return { nft: null, staking: null, token: null };
    return {
      nft:     new Contract(ADDRESSES.nft,         NFT_ABI,     signer),
      staking: new Contract(ADDRESSES.staking,     STAKING_ABI, signer),
      token:   new Contract(ADDRESSES.rewardToken, TOKEN_ABI,   signer),
    };
  }, [signer]);
}
