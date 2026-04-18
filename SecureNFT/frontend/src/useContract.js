import { useState, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import ABI from "./abi.json";

const CONTRACT_ADDRESS = "0x564A2d245F04b1dBA5B65FCe48920368B4f3C51B";

export function useContract() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (connecting) return;
    try {
      setConnecting(true);
      if (!window.ethereum) throw new Error("MetaMask not found");
      if ((await window.ethereum.request({ method: "wallet_getPermissions" })).length === 0)
        await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      setContract(new Contract(CONTRACT_ADDRESS, ABI, signer));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  }, [connecting]);

  return { account, contract, error, connecting, connect };
}
