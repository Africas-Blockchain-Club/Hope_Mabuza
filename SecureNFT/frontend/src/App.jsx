import { useState, useCallback } from "react";
import { useContract } from "./useContract";
import { useNFTGate } from "./useNFTGate";
import MintPanel from "./MintPanel";

const ROSE = 0n;
const LILY = 1n;

export default function App() {
  const { account, contract, error, connecting, connect } = useContract();
  const { hasAccess, checkAccess } = useNFTGate(account);
  const [balances, setBalances] = useState(null);

  const fetchBalances = useCallback(async () => {
    if (!contract || !account) return;
    const [rose, lily, roseSupply, lilySupply] = await Promise.all([
      contract.balanceOf(account, ROSE),
      contract.balanceOf(account, LILY),
      contract.totalSupply(ROSE),
      contract.totalSupply(LILY),
    ]);
    setBalances({ rose: rose.toString(), lily: lily.toString(), roseSupply: roseSupply.toString(), lilySupply: lilySupply.toString() });
  }, [contract, account]);

  return (
    <div>
      <h1>🌺 My Flowers NFT</h1>

      {!account ? (
        <button onClick={connect} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
      ) : (
        <p>Connected: {account}</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {account && (
        <>
          {hasAccess === null && <button onClick={checkAccess}>Check Access</button>}
          {hasAccess === false && <p style={{ color: "red" }}>❌ Access denied. You don't own any NFTs.</p>}
          {hasAccess === true && (
            <>
              <button onClick={fetchBalances}>Refresh Balances</button>
              {balances && (
                <table>
                  <thead><tr><th>Token</th><th>Your Balance</th><th>Total Supply</th></tr></thead>
                  <tbody>
                    <tr><td>🌹 ROSE</td><td>{balances.rose}</td><td>{balances.roseSupply} / 1000</td></tr>
                    <tr><td>🌸 LILY</td><td>{balances.lily}</td><td>{balances.lilySupply} / 1000</td></tr>
                  </tbody>
                </table>
              )}
              <MintPanel contract={contract} onMinted={fetchBalances} />
            </>
          )}
        </>
      )}
    </div>
  );
}
