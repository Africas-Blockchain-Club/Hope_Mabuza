import { useState } from "react";

export default function MintPanel({ contract, onMinted }) {
  const [amounts, setAmounts] = useState({ rose: "", lily: "", bothRose: "", bothLily: "" });
  const [status, setStatus] = useState(null);

  const set = (key) => (e) => setAmounts((p) => ({ ...p, [key]: e.target.value }));

  async function call(fn, ...args) {
    try {
      setStatus("Pending...");
      const tx = await fn(...args);
      await tx.wait();
      setStatus("Success!");
      onMinted();
    } catch (e) {
      setStatus(`Error: ${e.reason ?? e.message}`);
    }
  }

  return (
    <div>
      <h2>Mint</h2>

      <div>
        <h3>🌹 Mint Rose</h3>
        <input type="number" placeholder="Amount" value={amounts.rose} onChange={set("rose")} />
        <button onClick={() => call(contract.mintRose, amounts.rose)}>Mint Rose</button>
      </div>

      <div>
        <h3>🌸 Mint Lily</h3>
        <input type="number" placeholder="Amount" value={amounts.lily} onChange={set("lily")} />
        <button onClick={() => call(contract.mintLily, amounts.lily)}>Mint Lily</button>
      </div>

      <div>
        <h3>💐 Mint Both</h3>
        <input type="number" placeholder="Rose amount" value={amounts.bothRose} onChange={set("bothRose")} />
        <input type="number" placeholder="Lily amount" value={amounts.bothLily} onChange={set("bothLily")} />
        <button onClick={() => call(contract.mintBoth, amounts.bothRose, amounts.bothLily)}>Mint Both</button>
      </div>

      {status && <p>{status}</p>}
    </div>
  );
}
