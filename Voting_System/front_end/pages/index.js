import { useState, useEffect } from "react";
import { ethers } from "ethers";
import VotingABI from "../VotingV2.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function Home() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [votes1, setVotes1] = useState(0);
  const [votes2, setVotes2] = useState(0);
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [votingEnded, setVotingEnded] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask first!");
    const _provider = new ethers.BrowserProvider(window.ethereum);
    await _provider.send("eth_requestAccounts", []);
    const _signer = await _provider.getSigner();
    const _contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, _signer);
    setContract(_contract);
    setAccount(await _signer.getAddress());
    await loadData(_contract);
  }

  async function loadData(_contract) {
    setOption1(await _contract.option1());
    setOption2(await _contract.option2());
    setVotes1((await _contract.option1Votes()).toString());
    setVotes2((await _contract.option2Votes()).toString());
    
    const duration = await _contract.duration();
    const startTime = await _contract.startTime();
    const endTime = Number(startTime) + Number(duration);
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    setTimeLeft(remaining > 0 ? remaining : 0);
    setVotingEnded(remaining <= 0);
    
    if (remaining <= 0) {
      try {
        setWinner(await _contract.winner());
      } catch (err) {
        setWinner("");
      }
    }
  }

  useEffect(() => {
    if (!contract) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setVotingEnded(true);
          loadData(contract);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [contract]);

  async function vote(option) {
    try {
      setStatus("Sending vote...");
      const tx = await contract.vote(option);
      await tx.wait();
      setStatus("Vote cast successfully!");
      await loadData(contract);
    } catch (err) {
      setStatus(err.reason || err.message);
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-center mb-2 text-neutral-700">
          Voting System
        </h1>
        <p className="text-center text-sm text-neutral-400 mb-6">Cast your vote on the blockchain</p>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-neutral-700 text-white py-3 rounded-lg hover:bg-neutral-600 transition font-medium"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <p className="text-center text-xs text-neutral-400 mb-4 truncate">
              Connected: {account}
            </p>

            {contract && (
              <>
                <div className="mb-6 p-4 bg-gradient-to-r from-neutral-700 to-neutral-600 rounded-xl text-white text-center">
                  <p className="text-xs uppercase tracking-wide mb-1 opacity-80">Time Remaining</p>
                  <p className="text-2xl font-bold">{votingEnded ? "Voting Ended" : formatTime(timeLeft)}</p>
                </div>

                {!votingEnded ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => vote(1)}
                      className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-4 rounded-xl transition text-center"
                    >
                      <p className="text-lg font-medium">{option1}</p>
                      <p className="text-sm text-neutral-500">{votes1} votes</p>
                    </button>

                    <button
                      onClick={() => vote(2)}
                      className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-4 rounded-xl transition text-center"
                    >
                      <p className="text-lg font-medium">{option2}</p>
                      <p className="text-sm text-neutral-500">{votes2} votes</p>
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-6 bg-neutral-50 rounded-xl border-2 border-neutral-300 text-center">
                    <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2">Winner</p>
                    <p className="text-xl text-neutral-800 font-bold">{winner}</p>
                    <div className="mt-4 flex justify-around text-sm">
                      <div>
                        <p className="text-neutral-500">{option1}</p>
                        <p className="font-semibold text-neutral-700">{votes1} votes</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">{option2}</p>
                        <p className="font-semibold text-neutral-700">{votes2} votes</p>
                      </div>
                    </div>
                  </div>
                )}

                {status && (
                  <p className="mt-4 text-center text-sm text-neutral-500">{status}</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
