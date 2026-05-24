import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useWeb3 } from "../context/Web3Context";
import ConnectGate from "../components/ConnectGate";
import RewardCounter from "../components/RewardCounter";
import CooldownTimer from "../components/CooldownTimer";

const syne = { fontFamily: "Syne, sans-serif" };
const dm   = { fontFamily: "DM Sans, sans-serif" };

export default function Stake() {
  const { stake, nfts, rewards, wallet } = useWeb3();
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(".sk-label", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 })
      .fromTo(".sk-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
      .fromTo(".sk-desc",  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
      .fromTo(".sk-body",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
  }, []);

  async function handleStake() {
    if (selected === null) return;
    const ok = await stake.execute(selected);
    if (ok) setSelected(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-16 pt-24">
      <div className="w-full max-w-2xl">

        <p className="sk-label text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "rgba(120,160,255,0.7)", ...dm }}>
          Vault · Earn GLXY
        </p>

        <h1 className="sk-title font-bold leading-none mb-8"
          style={{ ...syne, fontSize: "clamp(50px, 9vw, 96px)", letterSpacing: "-2.5px", color: "#e8eeff" }}>
          Put your NFT<br />
          <span style={{ background: "linear-gradient(135deg, #a8c8ff, #6090e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            to work.
          </span>
        </h1>

        <p className="sk-desc text-lg leading-relaxed mb-12 mx-auto"
          style={{ color: "rgba(160,185,255,0.55)", maxWidth: "460px", ...dm }}>
          Staking locks your NFT into the vault and starts generating GLXY every minute.
          A 5-minute cooldown applies before you can unstake. Hit 100 GLXY and head to{" "}
          <button onClick={() => navigate("/exchange")}
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "rgba(180,210,255,0.85)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            Exchange
          </button>.
        </p>

        {!wallet.address ? <ConnectGate action="stake" /> : (
          <div className="sk-body w-full">

            {nfts.stakedNFTs.length > 0 && (
              <div className="mb-12">
                <RewardCounter pending={rewards.pending} balance={rewards.balance} />
                <div className="mt-6"><CooldownTimer coolEnd={rewards.coolEnd} cooldownOver={rewards.cooldownOver} /></div>
              </div>
            )}

            {nfts.stakedNFTs.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-semibold tracking-widest uppercase mb-5"
                  style={{ color: "rgba(120,160,255,0.35)", ...dm }}>Currently staked</p>
                <div className="flex flex-col items-center gap-3">
                  {nfts.stakedNFTs.map(id => (
                    <div key={id} className="flex items-center gap-6">
                      <span className="font-mono text-xs" style={{ color: "rgba(120,160,255,0.3)" }}>#</span>
                      <span className="text-base font-medium" style={{ color: "#c8d8ff", ...syne }}>Galaxy NFT #{id}</span>
                      <span className="text-xs" style={{ color: "rgba(120,160,255,0.4)", ...dm }}>earning GLXY</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: "rgba(120,160,255,0.35)", ...dm }}>Available to stake</p>

              {nfts.walletNFTs.length === 0 ? (
                <p className="text-base" style={{ color: "rgba(160,185,255,0.4)", ...dm }}>
                  No NFTs in wallet.{" "}
                  <button onClick={() => navigate("/mint")}
                    className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: "rgba(180,210,255,0.7)" }}>
                    Mint one first
                  </button>.
                </p>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {nfts.walletNFTs.map(id => (
                    <button key={id} onClick={() => setSelected(id)}
                      className="flex items-center gap-6 transition-all duration-150 hover:opacity-80">
                      <span className="font-mono text-xs" style={{ color: "rgba(120,160,255,0.3)" }}>#</span>
                      <span className="text-base font-medium"
                        style={{ color: selected === id ? "#e8eeff" : "#c8d8ff", ...syne }}>
                        Galaxy NFT #{id}
                      </span>
                      <span className="text-xs font-mono"
                        style={{ color: selected === id ? "rgba(130,190,255,0.9)" : "rgba(120,160,255,0.4)" }}>
                        {selected === id ? "selected ✓" : "142% APY"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {stake.error && <p className="text-sm mb-4" style={{ color: "#f87171", ...dm }}>{stake.error}</p>}

            <button
              className="btn-scan px-12 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              disabled={selected === null || stake.loading}
              style={{ background: "rgba(60,100,200,0.35)", border: "1px solid rgba(100,150,255,0.35)", color: "#d0e0ff", ...syne, letterSpacing: "0.5px" }}
              onClick={handleStake}
            >
              {stake.loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Staking…
                </span>
              ) : "Stake NFT"}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
