import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useWeb3 } from "../context/Web3Context";
import ConnectGate from "../components/ConnectGate";
import RewardCounter from "../components/RewardCounter";
import CooldownTimer from "../components/CooldownTimer";

const syne = { fontFamily: "Syne, sans-serif" };
const dm   = { fontFamily: "DM Sans, sans-serif" };

export default function Unstake() {
  const { unstake, nfts, rewards, wallet } = useWeb3();
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(".un-label", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 })
      .fromTo(".un-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
      .fromTo(".un-desc",  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
      .fromTo(".un-body",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
  }, []);

  async function handleUnstake() {
    if (selected === null) return;
    const ok = await unstake.execute(selected);
    if (ok) setSelected(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-16 pt-24">
      <div className="w-full max-w-2xl">

        <p className="un-label text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "rgba(120,160,255,0.7)", ...dm }}>
          Vault · Withdraw
        </p>

        <h1 className="un-title font-bold leading-none mb-8"
          style={{ ...syne, fontSize: "clamp(50px, 9vw, 96px)", letterSpacing: "-2.5px", color: "#e8eeff" }}>
          Take back<br />
          <span style={{ background: "linear-gradient(135deg, #a8c8ff, #6090e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            your NFT.
          </span>
        </h1>

        <p className="un-desc text-lg leading-relaxed mb-12 mx-auto"
          style={{ color: "rgba(160,185,255,0.55)", maxWidth: "460px", ...dm }}>
          Withdraw your staked NFT once the cooldown has passed. Your earned GLXY is
          claimed automatically in the same transaction — nothing left behind.
        </p>

        {!wallet.address ? <ConnectGate action="unstake" /> : (
          <div className="un-body w-full">

            {nfts.stakedNFTs.length > 0 && (
              <div className="mb-12">
                <RewardCounter pending={rewards.pending} balance={rewards.balance} />
                <div className="mt-6"><CooldownTimer coolEnd={rewards.coolEnd} cooldownOver={rewards.cooldownOver} /></div>
              </div>
            )}

            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: "rgba(120,160,255,0.35)", ...dm }}>Your staked NFTs</p>

              {nfts.stakedNFTs.length === 0 ? (
                <p className="text-base" style={{ color: "rgba(160,185,255,0.4)", ...dm }}>
                  Nothing staked yet.{" "}
                  <button onClick={() => navigate("/stake")}
                    className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: "rgba(180,210,255,0.7)" }}>
                    Go stake your NFT
                  </button>.
                </p>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {nfts.stakedNFTs.map(id => (
                    <button key={id} onClick={() => setSelected(id)}
                      className="flex items-center gap-6 transition-all duration-150 hover:opacity-80">
                      <span className="font-mono text-xs" style={{ color: "rgba(120,160,255,0.3)" }}>#</span>
                      <span className="text-base font-medium"
                        style={{ color: selected === id ? "#e8eeff" : "#c8d8ff", ...syne }}>
                        Galaxy NFT #{id}
                      </span>
                      <span className="text-xs"
                        style={{ color: selected === id ? "rgba(130,190,255,0.9)" : "rgba(120,160,255,0.4)", ...dm }}>
                        {selected === id ? "selected ✓" : "staked"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!rewards.cooldownOver && nfts.stakedNFTs.length > 0 && (
              <p className="text-sm mb-4" style={{ color: "rgba(240,170,60,0.7)", ...dm }}>
                Cooldown not finished — wait a moment before unstaking.
              </p>
            )}
            {unstake.error && <p className="text-sm mb-4" style={{ color: "#f87171", ...dm }}>{unstake.error}</p>}
            {rewards.error  && <p className="text-sm mb-4" style={{ color: "#f87171", ...dm }}>{rewards.error}</p>}

            <div className="flex flex-col items-center gap-3 w-full">
              {/* Claim rewards only */}
              <button
                className="btn-scan px-12 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                disabled={rewards.loading || parseFloat(rewards.pending || 0) === 0 || !rewards.cooldownOver}
                style={{ background: "rgba(60,100,200,0.35)", border: "1px solid rgba(100,150,255,0.35)", color: "#d0e0ff", ...syne, letterSpacing: "0.5px" }}
                onClick={rewards.claim}
              >
                {rewards.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Claiming…
                  </span>
                ) : "Claim rewards"}
              </button>

              {/* Unstake + claim together */}
              <button
                className="btn-scan px-12 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                disabled={selected === null || unstake.loading || !rewards.cooldownOver}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(100,150,255,0.18)", color: "rgba(180,210,255,0.55)", ...syne, letterSpacing: "0.5px" }}
                onClick={handleUnstake}
              >
                {unstake.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Unstaking…
                  </span>
                ) : "Unstake & claim rewards"}
              </button>

              <p className="text-xs mt-1" style={{ color: "rgba(120,160,255,0.3)", ...dm }}>
                Claim keeps your NFT staked · Unstake withdraws it
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
