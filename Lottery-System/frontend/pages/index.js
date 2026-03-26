import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import ABI from "../lib/abi";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function Home() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [round, setRound] = useState(null);
  const [roundId, setRoundId] = useState(null);
  const [entryFee, setEntryFee] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [pot, setPot] = useState("0");
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [pendingReward, setPendingReward] = useState("0");
  const [lastWinningNumbers, setLastWinningNumbers] = useState(null);

  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setRound(null);
    setRoundId(null);
    setEntryFee(null);
    setTicketCount(0);
    setPot("0");
    setTimeLeft(null);
    setHasEntered(false);
    setPendingReward("0");
    setLastWinningNumbers(null);
    setSelected([]);
    setStatus("");
  };

  // connect wallet
  const connect = async () => {
    if (!window.ethereum) return setStatus("MetaMask not found.");
    const p = new ethers.BrowserProvider(window.ethereum);
    await p.send("eth_requestAccounts", []);
    const signer = await p.getSigner();
    const addr = await signer.getAddress();
    const c = new ethers.Contract(CONTRACT, ABI, signer);
    setProvider(p);
    setAccount(addr);
    setContract(c);
  };

  // load chain data
  const load = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const id = await contract.currentRoundId();
      const r = await contract.rounds(id);
      const fee = await contract.entryFee();
      const count = await contract.getRoundTicketCount(id);
      const entered = await contract.hasEntered(id, account);
      const reward = await contract.pendingRewards(account);

      setRoundId(id.toString());
      setRound(r);
      setEntryFee(fee);
      setTicketCount(count.toString());
      setPot(ethers.formatEther(r.pot));
      setHasEntered(entered);
      setPendingReward(ethers.formatEther(reward));

      // last round winning numbers
      if (id > 1n) {
        const prev = await contract.getRoundWinningNumbers(id - 1n);
        setLastWinningNumbers(prev.map((n) => n.toString()));
      }
    } catch (e) {
      console.error(e);
    }
  }, [contract, account]);

  // countdown timer
  useEffect(() => {
    if (!round) return;
    const calc = () => {
      const end = Number(round.endTime) * 1000;
      const diff = end - Date.now();
      if (diff <= 0) return setTimeLeft("Waiting for draw...");
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s.toString().padStart(2, "0")}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [round]);

  // poll chain every 15s
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const toggleNumber = (n) => {
    if (selected.includes(n)) {
      setSelected(selected.filter((x) => x !== n));
    } else if (selected.length < 7) {
      setSelected([...selected, n]);
    }
  };

  const buyTicket = async () => {
    if (selected.length !== 7) return setStatus("Select exactly 7 numbers.");
    if (!contract || !entryFee) return;
    try {
      setLoading(true);
      setStatus("Submitting ticket...");
      const sorted = [...selected].sort((a, b) => a - b);
      const tx = await contract.buyTicket(sorted, { value: entryFee });
      await tx.wait();
      setStatus("Ticket submitted! ✅");
      setSelected([]);
      load();
    } catch (e) {
      setStatus(e.reason || e.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    try {
      setLoading(true);
      setStatus("Withdrawing reward...");
      const tx = await contract.withdrawReward();
      await tx.wait();
      setStatus("Reward withdrawn! ✅");
      load();
    } catch (e) {
      setStatus(e.reason || e.message || "Withdraw failed.");
    } finally {
      setLoading(false);
    }
  };

  const roundStatus = round
    ? round.drawRequested
      ? "Draw in progress..."
      : round.active
      ? "Open"
      : "Closed"
    : "—";

  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "#000", fontFamily: "monospace" }}>

      {/* header */}
      <div style={{ borderBottom: "2px solid #000", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "2px" }}>🎰 LOTTERY</span>
        {account ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ border: "1px solid #000", padding: "6px 12px", fontSize: "12px" }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button onClick={disconnect} style={{ ...outlineBtn, padding: "6px 12px", fontSize: "12px" }}>Disconnect</button>
          </div>
        ) : (
          <button onClick={connect} style={btnStyle}>Connect Wallet</button>
        )}
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>

        {!account ? (
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎰</div>
            <p style={{ marginBottom: "24px", fontSize: "16px" }}>Connect your wallet to play</p>
            <button onClick={connect} style={{ ...btnStyle, padding: "12px 32px", fontSize: "16px" }}>Connect Wallet</button>
          </div>
        ) : (
          <>
            {/* round info */}
            <div style={{ border: "2px solid #000", padding: "20px", marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", textAlign: "center" }}>
                <Stat label="Round" value={roundId ?? "—"} />
                <Stat label="Status" value={roundStatus} />
                <Stat label="Pot" value={`${pot} ETH`} />
                <Stat label="Time Left" value={timeLeft ?? "—"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "center", marginTop: "16px", borderTop: "1px solid #000", paddingTop: "16px" }}>
                <Stat label="Tickets" value={ticketCount} />
                <Stat label="Entry Fee" value={entryFee ? `${ethers.formatEther(entryFee)} ETH` : "—"} />
              </div>
            </div>

            {/* last winning numbers */}
            {lastWinningNumbers && (
              <div style={{ border: "2px solid #000", padding: "16px", marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>LAST WINNING NUMBERS</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {lastWinningNumbers.map((n, i) => (
                    <div key={i} style={{ width: "36px", height: "36px", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", background: "#000", color: "#fff" }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* pending reward */}
            {parseFloat(pendingReward) > 0 && (
              <div style={{ border: "2px solid #000", padding: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🏆 Pending Reward: <strong>{pendingReward} ETH</strong></span>
                <button onClick={withdraw} disabled={loading} style={btnStyle}>Withdraw</button>
              </div>
            )}

            {/* ticket entry */}
            {hasEntered ? (
              <div style={{ border: "2px solid #000", padding: "20px", textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "14px", letterSpacing: "1px" }}>✅ YOU HAVE ENTERED THIS ROUND</div>
                <div style={{ fontSize: "12px", marginTop: "8px", color: "#555" }}>Come back after the draw to see results</div>
              </div>
            ) : round?.active && !round?.drawRequested ? (
              <div style={{ border: "2px solid #000", padding: "20px", marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", marginBottom: "16px" }}>
                  PICK 7 NUMBERS ({selected.length}/7)
                </div>

                {/* number grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "16px" }}>
                  {Array.from({ length: 49 }, (_, i) => i + 1).map((n) => {
                    const isSelected = selected.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => toggleNumber(n)}
                        style={{
                          padding: "10px 0",
                          border: "1px solid #000",
                          background: isSelected ? "#000" : "#fff",
                          color: isSelected ? "#fff" : "#000",
                          cursor: "pointer",
                          fontFamily: "monospace",
                          fontWeight: isSelected ? "bold" : "normal",
                          fontSize: "13px",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                {/* selected display */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", minHeight: "40px", flexWrap: "wrap" }}>
                  {selected.length === 0 ? (
                    <span style={{ fontSize: "12px", color: "#888" }}>No numbers selected</span>
                  ) : (
                    [...selected].sort((a, b) => a - b).map((n) => (
                      <div key={n} style={{ width: "36px", height: "36px", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", background: "#000", color: "#fff" }}>
                        {n}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    onClick={buyTicket}
                    disabled={loading || selected.length !== 7}
                    style={{
                      ...btnStyle,
                      padding: "12px 32px",
                      opacity: selected.length !== 7 ? 0.4 : 1,
                      cursor: selected.length !== 7 ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Submitting..." : `Buy Ticket — ${entryFee ? ethers.formatEther(entryFee) : "?"} ETH`}
                  </button>
                  {selected.length > 0 && (
                    <button onClick={() => setSelected([])} style={{ ...outlineBtn }}>Clear</button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ border: "2px solid #000", padding: "20px", textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "14px", letterSpacing: "1px" }}>
                  {round?.drawRequested ? "⏳ DRAW IN PROGRESS — WAITING FOR VRF" : "⏳ WAITING FOR NEXT ROUND"}
                </div>
              </div>
            )}

            {/* status message */}
            {status && (
              <div style={{ border: "1px solid #000", padding: "12px 16px", fontSize: "13px", marginBottom: "16px" }}>
                {status}
              </div>
            )}

            {/* reward tiers */}
            <div style={{ border: "2px solid #000", padding: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>REWARD TIERS (of 90% prize pool)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", textAlign: "center" }}>
                {[["2", "5%"], ["3", "10%"], ["4", "15%"], ["5", "20%"], ["6", "20%"], ["7", "30%"]].map(([m, r]) => (
                  <div key={m} style={{ border: "1px solid #000", padding: "8px 4px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>{m}</div>
                    <div style={{ fontSize: "11px" }}>{r}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "11px", marginTop: "12px", color: "#555" }}>
                10% owner fee · Unmatched tiers roll over to next round · Numbers matched from left
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontWeight: "bold", fontSize: "15px" }}>{value}</div>
    </div>
  );
}

const btnStyle = {
  background: "#000",
  color: "#fff",
  border: "2px solid #000",
  padding: "8px 16px",
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: "13px",
  letterSpacing: "1px",
};

const outlineBtn = {
  background: "#fff",
  color: "#000",
  border: "2px solid #000",
  padding: "8px 16px",
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: "13px",
};
