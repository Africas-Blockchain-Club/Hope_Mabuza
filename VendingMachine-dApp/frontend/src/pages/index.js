import { useState } from "react";
import { ethers } from "ethers";
import VendingMachineArtifact from "../abi/VendingMachine.json";
const VendingMachineABI = VendingMachineArtifact.abi;


const CONTRACT_ADDRESS = "0xB266590c076742C52D790786D16aAED5F1665685";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [stock, setStock] = useState(null);
  const [purchaseAmt, setPurchaseAmt] = useState(1);
  const [restockAmt, setRestockAmt] = useState(1);
  const [status, setStatus] = useState("");

  function getContract(withSigner = false) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (!withSigner) return new ethers.Contract(CONTRACT_ADDRESS, VendingMachineABI, provider);
    return provider.getSigner().then((signer) => new ethers.Contract(CONTRACT_ADDRESS, VendingMachineABI, signer));
  }

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    setStatus("Wallet connected!");
  }

  async function getStock() {
    const contract = getContract();
    const balance = await contract.getVendingMachineBalance();
    setStock(balance.toString());
  }

  async function purchase() {
    try {
      const contract = await getContract(true);
      const tx = await contract.purchase(purchaseAmt, {
        value: ethers.parseEther((purchaseAmt * 2).toString()),
      });
      setStatus("Purchasing... waiting for confirmation.");
      await tx.wait();
      setStatus(`Purchased ${purchaseAmt} coke(s)!`);
      getStock();
    } catch (err) {
      setStatus(err.reason || err.message);
    }
  }

  async function restock() {
    try {
      const contract = await getContract(true);
      const tx = await contract.restock(restockAmt);
      setStatus("Restocking...");
      await tx.wait();
      setStatus(`Restocked ${restockAmt} unit(s)!`);
      getStock();
    } catch (err) {
      setStatus(err.reason || err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#141414] border border-purple-900 rounded-2xl shadow-[0_0_40px_rgba(128,0,255,0.15)] p-8 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">🥫 Vending Machine dApp</h1>
        </div>

        {/* Wallet */}
        {!account ? (
          <button onClick={connectWallet}
            className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-semibold transition-colors">
            Connect Wallet
          </button>
        ) : (
          <div className="bg-[#1e1e1e] border border-purple-800 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-purple-400 uppercase tracking-widest mb-0.5">Connected</p>
            <p className="text-white text-sm font-mono truncate">{account}</p>
          </div>
        )}

        {/* Stock */}
        <div className="bg-[#1e1e1e] border border-purple-900 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-purple-400 text-xs uppercase tracking-widest">Current Stock</p>
            <p className="text-white text-2xl font-bold mt-0.5">{stock !== null ? `${stock} cokes` : "—"}</p>
          </div>
          <button onClick={getStock}
            className="px-4 py-2 rounded-lg bg-purple-900 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
            Refresh
          </button>
        </div>

        {/* Purchase */}
        <div className="bg-[#1e1e1e] border border-purple-900 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest">Purchase</p>
          <div className="flex items-center gap-3">
            <input type="number" min="1" value={purchaseAmt} onChange={(e) => setPurchaseAmt(e.target.value)}
              className="w-16 rounded-lg bg-[#0d0d0d] border border-purple-800 text-white text-center px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            <button onClick={purchase}
              className="flex-1 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold transition-colors">
              Buy · {purchaseAmt * 2} ETH
            </button>
          </div>
        </div>

        {/* Restock */}
        <div className="bg-[#1e1e1e] border border-purple-900 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest">Restock <span className="text-purple-600 normal-case font-normal">(owner only)</span></p>
          <div className="flex items-center gap-3">
            <input type="number" min="1" value={restockAmt} onChange={(e) => setRestockAmt(e.target.value)}
              className="w-16 rounded-lg bg-[#0d0d0d] border border-purple-800 text-white text-center px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            <button onClick={restock}
              className="flex-1 py-2 rounded-lg bg-[#2a1a4a] hover:bg-purple-900 border border-purple-700 text-purple-300 font-semibold transition-colors">
              Restock
            </button>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className="bg-[#1a1a2e] border border-purple-800 rounded-xl px-4 py-3 text-center">
            <p className="text-purple-300 text-sm italic">{status}</p>
          </div>
        )}

      </div>
    </div>
  );
}
