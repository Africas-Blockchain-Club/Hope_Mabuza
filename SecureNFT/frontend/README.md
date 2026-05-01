# 🌹 Designing the Garden NFT Frontend
### A Step-by-Step Guide — From Blank Page to Mystical DApp

---

## WHY DESIGN AT ALL?

Your contract is deployed. Your hooks work. But right now your frontend is just text on a white page. Nobody wants to mint an NFT from a page that looks like a government form.

Design is not decoration — it's communication. When someone lands on your page, within 3 seconds they decide if they trust it enough to connect their wallet. A mystical, intentional design says: *this project has care behind it.*

---

## WHAT WE ARE BUILDING

A dark, enchanted garden aesthetic inspired by glowing roses, moonlit lilies, and a night sky full of sparkles. The palette is deep navy/black backgrounds with neon rose pink, teal, and gold accents.

**The final file structure after this guide:**

```
src/
├── App.jsx                      ← updated twice: first layout, then gate logic
├── index.css                    ← updated: all global styles, fonts, CSS variables
├── hooks/
│   ├── useContract.js           ← unchanged
│   └── useAccess.js             ← NEW: calls the server, holds authorized state
├── components/
│   ├── WalletConnect.jsx        ← updated: styled neon button
│   ├── ContractReader.jsx       ← updated: shows Lily balance in navbar
│   ├── ContractWriter.jsx       ← updated: lily-only minting (rose owners only)
│   └── ParticleField.jsx        ← NEW: floating sparkle particles on canvas
└── pages/
    ├── GatePage.jsx             ← NEW: connect wallet + check access screen
    └── HomePage.jsx             ← updated: shown only after access granted
```

---

## STEP 1 — Create the Pages Folder

**Why:** Right now everything is just components. As your app grows you will have multiple pages — a home page, a gallery page, an admin page. Putting pages in their own folder keeps things organised and makes it obvious what is a layout vs what is a reusable piece.

```bash
mkdir -p src/pages
```

That is it. One command. Now you have a proper place for full page layouts.

---

## STEP 2 — Global Styles and Design Tokens (`src/index.css`)

**Why:** Before writing any component code, you need to establish your design system. This means:

- **Fonts** — imported once, available everywhere
- **CSS Variables** — your colour palette defined in one place. If you want to change your rose colour, you change it once and it updates everywhere
- **Reusable classes** — button styles, card styles that every component can use without repeating code

**Why CSS variables specifically?** Because they cascade. You define `--rose: #e8417a` once and every component just says `color: var(--rose)`. No hunting through 10 files when your designer changes a colour.

Replace `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

:root {
  --night: #04020f;
  --deep: #0a0420;
  --rose: #e8417a;
  --rose-glow: #ff6ba8;
  --lily: #7effd4;
  --lily-glow: #00ffcc;
  --gold: #ffd700;
  --gold-glow: #ffe55c;
  --violet: #9b5de5;
  --violet-light: #c77dff;
  --font-display: 'Cinzel Decorative', serif;
  --font-body: 'Cormorant Garamond', serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--night);
  color: #e8d5f5;
  font-family: var(--font-body);
  font-size: 18px;
  overflow-x: hidden;
  cursor: crosshair;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--deep); }
::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 3px; }

/* Neon button base — shared by all mint buttons */
.btn-neon {
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  padding: 14px 32px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-neon:hover { transform: translateY(-2px); }
.btn-neon:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-rose {
  background: linear-gradient(135deg, #8b1a4a, #c73070);
  color: #fff;
  box-shadow: 0 0 20px rgba(232,65,122,0.5), inset 0 0 20px rgba(255,107,168,0.1);
}
.btn-rose:hover:not(:disabled) {
  box-shadow: 0 0 40px rgba(232,65,122,0.8), 0 0 80px rgba(232,65,122,0.3);
}

.btn-lily {
  background: linear-gradient(135deg, #006644, #00a878);
  color: #fff;
  box-shadow: 0 0 20px rgba(0,255,204,0.4), inset 0 0 20px rgba(126,255,212,0.1);
}
.btn-lily:hover:not(:disabled) {
  box-shadow: 0 0 40px rgba(0,255,204,0.7), 0 0 80px rgba(0,255,204,0.3);
}

.btn-gold {
  background: linear-gradient(135deg, #7a5c00, #c49a00);
  color: #fff;
  box-shadow: 0 0 20px rgba(255,215,0,0.4), inset 0 0 20px rgba(255,229,92,0.1);
}
.btn-gold:hover:not(:disabled) {
  box-shadow: 0 0 40px rgba(255,215,0,0.7), 0 0 80px rgba(255,215,0,0.3);
}

/* Card used throughout the app */
.card-mystical {
  background: linear-gradient(135deg, rgba(10,4,32,0.9), rgba(20,8,50,0.9));
  border: 1px solid rgba(155,93,229,0.3);
  border-radius: 4px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 40px rgba(155,93,229,0.1), inset 0 0 40px rgba(126,255,212,0.03);
}
```

**What each section does:**

- `@import` — loads two Google Fonts. Cinzel Decorative is the dramatic display font for titles. Cormorant Garamond is the elegant body font for descriptions. Both feel old-world and mystical.
- `:root` — your design tokens. Every colour and font defined once.
- `body` — dark background, crosshair cursor (feels like magic targeting)
- `.btn-neon` — base button class. The three variants (rose, lily, gold) extend it with their own glow colours
- `.card-mystical` — glassmorphism card with a subtle violet border and backdrop blur

---

## STEP 3 — The Particle Field (`src/components/ParticleField.jsx`)

**Why:** The image you shared has sparkles and floating light particles everywhere. We recreate this with an HTML5 Canvas element that sits fixed behind everything on the page. It runs a `requestAnimationFrame` loop drawing 120 particles that slowly drift upward and twinkle.

**Why canvas instead of CSS?** CSS can do some particles, but 120 individually animated elements with random behaviour, random colours, and random speeds is expensive in CSS. Canvas draws them all in one GPU-accelerated pass.

Create `src/components/ParticleField.jsx`:

```jsx
import { useEffect, useRef } from "react";

export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#ff6ba8", "#7effd4", "#ffd700", "#c77dff", "#ffffff"];

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random(),
      opacityDir: Math.random() > 0.5 ? 0.005 : -0.005,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.opacity += p.opacityDir;
        if (p.opacity >= 1 || p.opacity <= 0.1) p.opacityDir *= -1;

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -5) p.y = canvas.height + 5;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
```

**Key things to notice:**

- `position: fixed` — canvas stays in place when user scrolls
- `pointerEvents: none` — mouse clicks pass through the canvas to the content underneath
- `zIndex: 0` — sits behind everything (all content will have `zIndex: 1` or higher)
- The `return () => { cancelAnimationFrame... }` cleanup stops the loop when the component unmounts — without this you get memory leaks

---

## STEP 4 — The Wallet Connect Button (`src/components/WalletConnect.jsx`)

**Why we changed it:** The original was a plain HTML button with no styling. We apply the `.btn-neon.btn-rose` classes from our CSS and show the connected address in a teal glowing pill.

**Key concept:** This component still receives everything as props from App.jsx — nothing changed structurally. We only changed how it looks.

Replace `src/components/WalletConnect.jsx`:

```jsx
export default function WalletConnect({ account, isConnected, error, connectWallet }) {
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {error && (
        <span style={{ color: "var(--rose)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
          {error}
        </span>
      )}
      {!isConnected ? (
        <button className="btn-neon btn-rose" onClick={connectWallet}>
          ✦ Connect Wallet
        </button>
      ) : (
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--lily)",
          border: "1px solid rgba(126,255,212,0.3)",
          padding: "8px 16px",
          borderRadius: "2px",
          letterSpacing: "0.05em",
          textShadow: "0 0 10px var(--lily-glow)",
        }}>
          ◆ {shortAddress}
        </div>
      )}
    </div>
  );
}
```

---

## STEP 5 — Contract Reader (Balance Display) (`src/components/ContractReader.jsx`)

**Why we changed it:** Before, it was a generic "Current Value" display. Now it specifically reads Rose balance (token ID 0) and Lily balance (token ID 1) and shows them as coloured pills in the navbar. We also added `account` as a second prop because `balanceOf` needs both the wallet address and the token ID.

**Why show balances in the navbar?** Because the user should always be able to see what they own without scrolling. It also updates after minting — we pass a `key` prop from the parent that changes after each successful mint, which forces React to re-render and re-fetch.

Replace `src/components/ContractReader.jsx`:

```jsx
import { useState, useEffect } from "react";

export default function ContractReader({ contract, account }) {
  const [roseBalance, setRoseBalance] = useState(null);
  const [lilyBalance, setLilyBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchBalances() {
    // Need both contract and wallet address — if either is missing, stop
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      // Token ID 0 = ROSE, Token ID 1 = LILY
      // We call both at the same time with Promise.all for speed
      const [rose, lily] = await Promise.all([
        contract.balanceOf(account, 0),
        contract.balanceOf(account, 1),
      ]);
      setRoseBalance(rose.toString());
      setLilyBalance(lily.toString());
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Re-fetch when contract or account changes
  useEffect(() => {
    fetchBalances();
  }, [contract, account]);

  // Hide completely if wallet not connected
  if (!account) return null;

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      {isLoading ? (
        <span style={{ color: "var(--violet-light)", fontSize: "14px" }}>Loading...</span>
      ) : (
        <>
          <div style={balancePill("var(--rose)", "var(--rose-glow)")}>
            🌹 {roseBalance ?? "—"}
          </div>
          <div style={balancePill("var(--lily)", "var(--lily-glow)")}>
            🌿 {lilyBalance ?? "—"}
          </div>
        </>
      )}
      <button onClick={fetchBalances} style={{
        background: "none", border: "none", color: "var(--violet-light)",
        cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-body)", opacity: 0.7,
      }}>↻</button>
    </div>
  );
}

function balancePill(color, glow) {
  return {
    fontFamily: "var(--font-body)", fontSize: "14px", color,
    textShadow: `0 0 8px ${glow}`,
    border: `1px solid ${color}44`,
    padding: "6px 12px", borderRadius: "2px", letterSpacing: "0.05em",
  };
}
```

**New things here:**

- `Promise.all` — fetches both balances simultaneously instead of one after the other. Faster.
- `if (!account) return null` — React components can return null to render nothing. The balance pills disappear entirely when no wallet is connected.
- `balancePill` is a plain function that returns a style object — this is a simple way to share repeated inline styles without creating a whole component.

---

## STEP 6 — Contract Writer (Mint Buttons) (`src/components/ContractWriter.jsx`)

**Why we changed it:** The original had a generic text input and "Send Transaction" button. Now it has:
- Specific buttons for each mint type: Rose, Lily, Both
- A lily amount selector (1, 2, 3, 5) because mintLily takes an amount
- ETH prices shown on each button
- An `onSuccess` callback prop — after a successful mint it tells the parent to refresh the balance display

**Why an `onSuccess` prop?** Because after minting, the user's balance changed on-chain. But ContractReader doesn't know a mint happened. We solve this by passing a function down from HomePage — when the mint succeeds, ContractWriter calls `onSuccess()`, which triggers a refresh in the parent.

Replace `src/components/ContractWriter.jsx`:

```jsx
import { useState } from "react";
import { ethers } from "ethers";

export default function ContractWriter({ contract, isConnected, onSuccess }) {
  const [lilyAmount, setLilyAmount] = useState(1);
  const [loading, setLoading] = useState(null); // "rose" | "lily" | "both" | null
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  async function mint(type) {
    if (!contract || !isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(type);
      setError(null);
      setTxHash(null);

      let tx;

      if (type === "rose") {
        const price = ethers.parseEther("0.01");
        tx = await contract.mintRose({ value: price });
      }

      if (type === "lily") {
        const price = ethers.parseEther("0.005") * BigInt(lilyAmount);
        tx = await contract.mintLily(lilyAmount, { value: price });
      }

      if (type === "both") {
        const price = ethers.parseEther("0.01") + ethers.parseEther("0.005") * BigInt(lilyAmount);
        tx = await contract.mintBoth(lilyAmount, { value: price });
      }

      setTxHash(tx.hash);
      await tx.wait();

      // Tell the parent the mint succeeded so it can refresh balances
      if (onSuccess) onSuccess();

    } catch (err) {
      if (err.code === "ACTION_REJECTED") setError("Transaction rejected in MetaMask.");
      else if (err.code === "INSUFFICIENT_FUNDS") setError("Not enough ETH for gas.");
      else setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {/* Lily amount selector */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontFamily: "var(--font-body)", color: "var(--lily)", fontSize: "16px" }}>
          Lily Amount:
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3, 5].map((n) => (
            <button key={n} onClick={() => setLilyAmount(n)} style={{
              background: lilyAmount === n ? "var(--lily)" : "transparent",
              color: lilyAmount === n ? "var(--night)" : "var(--lily)",
              border: "1px solid var(--lily)",
              borderRadius: "2px", width: "36px", height: "36px",
              cursor: "pointer", fontFamily: "var(--font-body)",
              fontSize: "16px", transition: "all 0.2s",
            }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Mint buttons */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <button className="btn-neon btn-rose" onClick={() => mint("rose")} disabled={!!loading || !isConnected}>
          {loading === "rose" ? "Minting..." : "✦ Mint Rose — 0.01 ETH"}
        </button>
        <button className="btn-neon btn-lily" onClick={() => mint("lily")} disabled={!!loading || !isConnected}>
          {loading === "lily" ? "Minting..." : `✦ Mint ${lilyAmount} Lily — ${(0.005 * lilyAmount).toFixed(3)} ETH`}
        </button>
        <button className="btn-neon btn-gold" onClick={() => mint("both")} disabled={!!loading || !isConnected}>
          {loading === "both" ? "Minting..." : "✦ Mint Both"}
        </button>
      </div>

      {txHash && (
        <p style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--gold)", fontSize: "14px" }}>
          ✦ Transaction sent —{" "}
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
            style={{ color: "var(--gold)", textDecoration: "underline" }}>
            View on Etherscan
          </a>
        </p>
      )}
      {error && (
        <p style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--rose)", fontSize: "14px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
```

**Key things to notice:**

- `loading` state holds a string (`"rose"`, `"lily"`, `"both"`) not just a boolean. This lets each button show its own loading state independently while the others stay disabled.
- `ethers.parseEther("0.005") * BigInt(lilyAmount)` — ETH values in ethers v6 are BigInt. You cannot multiply a BigInt by a regular number, so you must wrap the amount in `BigInt()`.
- `!!loading` — double exclamation converts the string to a boolean. If loading is `"rose"`, `!!loading` is `true`, so all buttons disable.

---

## STEP 7 — The Home Page (`src/pages/HomePage.jsx`)

**Why a page instead of putting it all in App.jsx?** App.jsx should only care about state and routing — which page to show, what data to pass. The actual visual layout of a page belongs in its own file. This way when you add a Gallery page later, App.jsx barely changes.

**What HomePage does:**
- Renders the navbar with WalletConnect and ContractReader
- Renders the hero section with the SVG garden, parallax mouse effect, and animated elements
- Renders the mint section with NFT cards and ContractWriter
- Manages a `refreshKey` state — when a mint succeeds it increments this number, which is passed as `key` to ContractReader, forcing it to re-mount and re-fetch balances

Create `src/pages/HomePage.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";
import WalletConnect from "../components/WalletConnect";
import ContractReader from "../components/ContractReader";
import ContractWriter from "../components/ContractWriter";

export default function HomePage({ contract, account, isConnected, error, connectWallet }) {
  const roseRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mouse parallax — rose follows cursor slightly
  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      if (roseRef.current) {
        roseRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // After a mint, increment refreshKey to force ContractReader to re-fetch
  const handleMintSuccess = () => setRefreshKey((k) => k + 1);

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(to bottom, rgba(4,2,15,0.95), transparent)",
        borderBottom: "1px solid rgba(155,93,229,0.15)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "1rem",
          letterSpacing: "0.2em", color: "var(--gold)",
          textShadow: "0 0 20px var(--gold-glow)",
        }}>✦ MY FLOWERS</div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {/* key={refreshKey} forces re-mount after each mint */}
          <ContractReader key={refreshKey} contract={contract} account={account} />
          <WalletConnect account={account} isConnected={isConnected} error={error} connectWallet={connectWallet} />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", paddingTop: "80px",
      }}>
        {/* Background radial glows */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 50% at 50% 60%, rgba(155,93,229,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 30% 80%, rgba(0,255,204,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 70% 80%, rgba(232,65,122,0.08) 0%, transparent 60%)
          `,
        }} />

        {/* Moon */}
        <div style={{
          position: "absolute", top: "8%", right: "15%",
          width: "80px", height: "80px", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #e8f4ff, #b8d4f8)",
          boxShadow: "0 0 30px rgba(184,212,248,0.6), 0 0 60px rgba(184,212,248,0.3)",
          animation: "moonPulse 4s ease-in-out infinite",
        }} />

        {/* SVG Garden with parallax */}
        <div ref={roseRef} style={{
          width: "min(700px, 90vw)",
          transition: "transform 0.1s ease-out",
          marginBottom: "40px",
        }}>
          <svg viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", filter: "drop-shadow(0 0 40px rgba(155,93,229,0.3))" }}>
            <defs>
              <radialGradient id="roseGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff2d78" />
                <stop offset="40%" stopColor="#cc1f5a" />
                <stop offset="100%" stopColor="#7a0033" />
              </radialGradient>
              <radialGradient id="petalGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ff6ba8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8b1a4a" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="lilyGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e8f5ff" />
                <stop offset="100%" stopColor="#7effd4" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Ground mist */}
            <ellipse cx="350" cy="480" rx="320" ry="40" fill="rgba(126,255,212,0.06)" />

            {/* Stems */}
            <path d="M350 480 Q345 380 350 300" stroke="#1a5c35" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M160 480 Q155 420 160 370" stroke="#1a5c35" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M540 480 Q545 420 540 370" stroke="#1a5c35" strokeWidth="4" fill="none" strokeLinecap="round"/>

            {/* Leaves */}
            <path d="M350 400 Q310 370 290 360 Q320 385 350 400Z" fill="#1a7a40" opacity="0.8"/>
            <path d="M350 420 Q390 390 410 380 Q380 405 350 420Z" fill="#1a7a40" opacity="0.8"/>

            {/* Left Lily */}
            <g filter="url(#glow)">
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i}
                  cx={160 + Math.cos((angle*Math.PI)/180)*28}
                  cy={370 + Math.sin((angle*Math.PI)/180)*12}
                  rx="18" ry="32" fill="url(#lilyGrad)" opacity="0.85"
                  transform={`rotate(${angle}, ${160+Math.cos((angle*Math.PI)/180)*28}, ${370+Math.sin((angle*Math.PI)/180)*12})`}
                />
              ))}
              <circle cx="160" cy="370" r="10" fill="#ffd700" filter="url(#glow)"/>
              <circle cx="160" cy="370" r="5" fill="#fff"/>
            </g>

            {/* Right Lily */}
            <g filter="url(#glow)">
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i}
                  cx={540 + Math.cos((angle*Math.PI)/180)*28}
                  cy={370 + Math.sin((angle*Math.PI)/180)*12}
                  rx="18" ry="32" fill="url(#lilyGrad)" opacity="0.85"
                  transform={`rotate(${angle}, ${540+Math.cos((angle*Math.PI)/180)*28}, ${370+Math.sin((angle*Math.PI)/180)*12})`}
                />
              ))}
              <circle cx="540" cy="370" r="10" fill="#ffd700" filter="url(#glow)"/>
              <circle cx="540" cy="370" r="5" fill="#fff"/>
            </g>

            {/* Majestic Rose — center */}
            <g filter="url(#strongGlow)">
              {/* Outer petals */}
              {[0,45,90,135,180,225,270,315].map((angle, i) => (
                <ellipse key={i}
                  cx={350+Math.cos((angle*Math.PI)/180)*70}
                  cy={250+Math.sin((angle*Math.PI)/180)*55}
                  rx="45" ry="65" fill="url(#petalGrad)" opacity="0.75"
                  transform={`rotate(${angle}, ${350+Math.cos((angle*Math.PI)/180)*70}, ${250+Math.sin((angle*Math.PI)/180)*55})`}
                />
              ))}
              {/* Mid petals */}
              {[22,67,112,157,202,247,292,337].map((angle, i) => (
                <ellipse key={i}
                  cx={350+Math.cos((angle*Math.PI)/180)*42}
                  cy={250+Math.sin((angle*Math.PI)/180)*35}
                  rx="35" ry="52" fill="url(#roseGrad)" opacity="0.85"
                  transform={`rotate(${angle}, ${350+Math.cos((angle*Math.PI)/180)*42}, ${250+Math.sin((angle*Math.PI)/180)*35})`}
                />
              ))}
              {/* Inner petals */}
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i}
                  cx={350+Math.cos((angle*Math.PI)/180)*20}
                  cy={250+Math.sin((angle*Math.PI)/180)*15}
                  rx="22" ry="35" fill="#e8417a" opacity="0.9"
                  transform={`rotate(${angle}, ${350+Math.cos((angle*Math.PI)/180)*20}, ${250+Math.sin((angle*Math.PI)/180)*15})`}
                />
              ))}
              {/* Rose heart */}
              <circle cx="350" cy="250" r="22" fill="#ff1a5e"/>
              <circle cx="350" cy="250" r="12" fill="#ff6090"/>
              <circle cx="344" cy="244" r="5" fill="rgba(255,255,255,0.4)"/>
            </g>

            {/* Glow rings around rose */}
            <circle cx="350" cy="250" r="95" fill="none" stroke="rgba(255,107,168,0.3)" strokeWidth="1"/>
            <circle cx="350" cy="250" r="108" fill="none" stroke="rgba(155,93,229,0.15)" strokeWidth="1"/>

            {/* Fireflies */}
            {[[100,200],[580,180],[200,320],[480,300],[300,150],[420,420]].map(([fx,fy],i)=>(
              <circle key={i} cx={fx} cy={fy} r="3" fill="#ffd700" filter="url(#glow)" opacity="0.8"
                style={{animation:`firefly ${2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.3}s`}}/>
            ))}
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
          letterSpacing: "0.25em", textAlign: "center", lineHeight: 1.2, marginBottom: "16px",
          background: "linear-gradient(135deg, var(--rose-glow), var(--gold), var(--lily))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          filter: "drop-shadow(0 0 20px rgba(232,65,122,0.5))",
        }}>THE ENCHANTED GARDEN</h1>

        <p style={{
          fontFamily: "var(--font-body)", fontStyle: "italic",
          fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "rgba(232,213,245,0.7)",
          letterSpacing: "0.1em", marginBottom: "60px", textAlign: "center",
        }}>Where each flower blooms eternal on the blockchain</p>

        <div style={{ animation: "bounce 2s ease-in-out infinite", color: "var(--violet-light)", fontSize: "24px", opacity: 0.6 }}>▾</div>
      </section>

      {/* MINT SECTION */}
      <section style={{ padding: "120px 48px", maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 3vw, 2rem)",
            letterSpacing: "0.2em", color: "var(--gold)",
            textShadow: "0 0 20px var(--gold-glow)", marginBottom: "16px",
          }}>✦ CLAIM YOUR FLOWER ✦</h2>
          <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "rgba(232,213,245,0.6)", fontSize: "1.1rem" }}>
            Each NFT is a soul bound to the garden forever
          </p>
        </div>

        {/* NFT info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "48px" }}>
          <NftCard emoji="🌹" name="The Crimson Rose" desc="A soulbound rose of eternal flame. Only one may bloom per wallet." price="0.01 ETH" color="var(--rose)" glow="var(--rose-glow)" max="100 max supply" />
          <NftCard emoji="🌿" name="The Moonlit Lily" desc="Delicate as starlight. Mint up to 5 lilies to fill your garden." price="0.005 ETH each" color="var(--lily)" glow="var(--lily-glow)" max="10,000 max supply" />
          <NftCard emoji="✦" name="The Full Garden" desc="Claim both a Rose and your chosen Lilies in a single ritual." price="Combined price" color="var(--gold)" glow="var(--gold-glow)" max="Limited offering" />
        </div>

        {/* Mint controls card */}
        <div className="card-mystical" style={{ padding: "40px" }}>
          {!isConnected && (
            <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "rgba(232,213,245,0.5)", marginBottom: "24px" }}>
              Connect your wallet to begin the ritual
            </p>
          )}
          <ContractWriter contract={contract} isConnected={isConnected} onSuccess={handleMintSuccess} />
        </div>
      </section>

      {/* Keyframe animations */}
      <style>{`
        @keyframes moonPulse {
          0%,100%{box-shadow:0 0 30px rgba(184,212,248,0.6),0 0 60px rgba(184,212,248,0.3)}
          50%{box-shadow:0 0 50px rgba(184,212,248,0.9),0 0 100px rgba(184,212,248,0.5)}
        }
        @keyframes firefly {
          0%,100%{opacity:0.2;transform:translate(0,0)}
          50%{opacity:1;transform:translate(6px,-8px)}
        }
        @keyframes bounce {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(8px)}
        }
      `}</style>
    </div>
  );
}

// Reusable NFT info card component
function NftCard({ emoji, name, desc, price, color, glow, max }) {
  return (
    <div className="card-mystical"
      style={{ padding: "32px 24px", textAlign: "center", transition: "transform 0.3s, box-shadow 0.3s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-8px)"; e.currentTarget.style.boxShadow=`0 0 40px ${color}44`; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=""; }}>
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{emoji}</div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", letterSpacing: "0.15em", color, textShadow: `0 0 15px ${glow}`, marginBottom: "12px" }}>{name}</h3>
      <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "0.95rem", color: "rgba(232,213,245,0.65)", lineHeight: 1.6, marginBottom: "16px" }}>{desc}</p>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color, letterSpacing: "0.1em", marginBottom: "6px" }}>{price}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(232,213,245,0.4)" }}>{max}</div>
    </div>
  );
}
```

**Why `NftCard` is defined inside the same file and not in its own file?** Because it is only used in HomePage. Creating a separate file for every tiny component is overkill. The rule is: if a component is used in more than one place, extract it. If it is only used in one place, keeping it in the same file is fine.

---

## STEP 8 — Update App.jsx (`src/App.jsx`)

**Why:** App.jsx gets simpler now that we have a HomePage. It just calls `useContract()` once and passes everything to `HomePage`. It also renders `ParticleField` which sits behind everything.

Replace `src/App.jsx`:

```jsx
import { useContract } from "./hooks/useContract";
import ParticleField from "./components/ParticleField";
import HomePage from "./pages/HomePage";

function App() {
  // Called ONCE — all values passed down as props
  const { contract, account, isConnected, error, connectWallet } = useContract();

  return (
    <>
      {/* Sparkles sit behind everything — zIndex: 0 */}
      <ParticleField />

      {/* Main page — zIndex: 1 and above */}
      <HomePage
        contract={contract}
        account={account}
        isConnected={isConnected}
        error={error}
        connectWallet={connectWallet}
      />
    </>
  );
}

export default App;
```

**Why `<>` instead of `<div>`?** The angle bracket pair `<>...</>` is a React Fragment — it groups elements without adding an extra `<div>` to the DOM. We do not need a wrapper div here since ParticleField is fixed-position and HomePage fills the page.

---

## STEP 9 — Run It (Design Only, No Gate Yet)

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## WHAT YOU SHOULD SEE (After Steps 1–9)

- Dark night sky background
- 120 floating coloured sparkle particles drifting upward and twinkling
- A glowing crescent moon in the top right with a pulse animation
- A purple/teal radial glow in the background
- The SVG garden: rose in the center with three layers of petals, two teal lilies on either side, animated fireflies
- The rose follows your mouse cursor slightly (parallax)
- The title "THE ENCHANTED GARDEN" with a gradient from rose to gold to teal
- Scrolling down reveals NFT cards that lift and glow on hover
- The mint controls: lily amount selector and mint buttons
- After connecting wallet: balance pills appear in the navbar
- After minting: balance updates automatically

---

## PART 2 — ADDING THE ACCESS GATE

### Why a Gate?

Right now anyone can visit your page and mint lilies — even people who do not own a Rose. Your Rose NFT is supposed to be exclusive. Only Rose holders get access to the garden.

The gate enforces this rule:

```
Land on page
     ↓
GatePage: Connect Wallet
     ↓
Click "Check Access"
     ↓
Frontend sends wallet address → your Express server on port 3000
     ↓
Server asks the contract: does this wallet own Rose (token ID 0)?
     ↓
YES → show HomePage (full garden + lily minting)
NO  → show "No Rose found" message
```

**Why check on the server and not just in the frontend?**

Because frontend checks can be bypassed. A user could open DevTools and set a variable to `true`. Your server talks directly to the blockchain — it cannot be fooled. This is the right pattern for any access-controlled DApp.

**Do you need to "connect" the frontend to the server?**

No special setup. Your server runs on `http://localhost:3000`. Your frontend uses the browser's built-in `fetch()` to send HTTP requests to it. Your server already has this line:

```javascript
app.use(cors({ origin: 'http://localhost:5173' }));
```

That `cors` line is what allows the frontend and server to talk. Without it the browser would block the request. You already have it — you are good.

**Order to run things:**

```bash
# Terminal 1 — start the server first
node server.js

# Terminal 2 — start the frontend
npm run dev
```

---

## STEP 10 — The Access Hook (`src/hooks/useAccess.js`)

**Why a separate hook for this?** Because checking server access is a completely different concern from connecting to the blockchain. `useContract.js` handles blockchain connections. `useAccess.js` handles server communication. One job per file.

Create `src/hooks/useAccess.js`:

```javascript
import { useState } from "react";

const SERVER_URL = "http://localhost:3000";

export function useAccess() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [accessMessage, setAccessMessage] = useState(null);
  const [accessError, setAccessError] = useState(null);

  async function checkAccess(walletAddress) {
    if (!walletAddress) {
      setAccessError("No wallet address found. Please connect your wallet first.");
      return;
    }

    try {
      setIsChecking(true);
      setAccessMessage(null);
      setAccessError(null);

      // Send the wallet address to your Express server
      // The server checks the blockchain and responds with authorized: true/false
      const response = await fetch(`${SERVER_URL}/verify-nft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (data.authorized) {
        setIsAuthorized(true);
        setAccessMessage(data.message); // "Access Granted"
      } else {
        setIsAuthorized(false);
        setAccessError(data.message); // "No NFT found"
      }
    } catch (err) {
      // This fires if the server is not running
      setAccessError("Could not reach the server. Make sure it is running on port 3000.");
      console.error("Access check error:", err);
    } finally {
      setIsChecking(false);
    }
  }

  return { isAuthorized, isChecking, accessMessage, accessError, checkAccess };
}
```

**What each piece does:**

- `isAuthorized` — the boolean that controls which page the user sees. `false` = gate page. `true` = garden page.
- `isChecking` — shows a loading state on the button while the server is responding
- `accessMessage` — the success message from the server ("Access Granted")
- `accessError` — either a server error or "No NFT found"
- `checkAccess(walletAddress)` — the function that calls your server. It takes the wallet address, POSTs it to `/verify-nft`, and updates state based on the response
- The `catch` block handles the case where your server is not running — without this the user would just see a silent failure

---

## STEP 11 — The Gate Page (`src/pages/GatePage.jsx`)

**Why a separate page?** The gate and the garden are two completely different experiences. Mixing them in one file would create exactly the spaghetti code we have been avoiding. GatePage has one job: let the user connect their wallet and check if they have access.

Create `src/pages/GatePage.jsx`:

```jsx
export default function GatePage({
  account,
  isConnected,
  error,
  connectWallet,
  isAuthorized,
  isChecking,
  accessMessage,
  accessError,
  checkAccess,
}) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 1,
      padding: "24px",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 50% 60% at 50% 50%, rgba(155,93,229,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 30% 30% at 30% 70%, rgba(232,65,122,0.07) 0%, transparent 60%)
        `,
      }} />

      {/* Gate card */}
      <div className="card-mystical" style={{
        padding: "64px 56px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
      }}>

        {/* Rose emblem */}
        <div style={{
          fontSize: "4rem",
          marginBottom: "8px",
          filter: "drop-shadow(0 0 20px rgba(232,65,122,0.8))",
          animation: "roseGlow 3s ease-in-out infinite",
        }}>🌹</div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          letterSpacing: "0.25em",
          color: "var(--gold)",
          textShadow: "0 0 20px var(--gold-glow)",
          marginBottom: "12px",
        }}>THE ENCHANTED GARDEN</h1>

        <p style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          color: "rgba(232,213,245,0.6)",
          fontSize: "1rem",
          lineHeight: 1.7,
          marginBottom: "48px",
        }}>
          This garden is sacred.<br />
          Only those who hold the Crimson Rose may enter.
        </p>

        {/* Divider */}
        <div style={{
          width: "60px", height: "1px",
          background: "linear-gradient(to right, transparent, var(--violet), transparent)",
          margin: "0 auto 40px",
        }} />

        {/* Step 1: Connect wallet */}
        {!isConnected && (
          <div>
            <p style={{
              fontFamily: "var(--font-body)",
              color: "rgba(232,213,245,0.5)",
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              marginBottom: "20px",
              textTransform: "uppercase",
            }}>Step 1 — Identify yourself</p>
            <button className="btn-neon btn-rose" onClick={connectWallet}>
              ✦ Connect Wallet
            </button>
            {error && (
              <p style={{ marginTop: "16px", color: "var(--rose)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Check access — only shown after wallet is connected */}
        {isConnected && !isAuthorized && (
          <div>
            {/* Show connected address */}
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--lily)",
              textShadow: "0 0 10px var(--lily-glow)",
              border: "1px solid rgba(126,255,212,0.2)",
              padding: "8px 16px",
              borderRadius: "2px",
              marginBottom: "32px",
              letterSpacing: "0.05em",
            }}>
              ◆ {account.slice(0, 6)}...{account.slice(-4)}
            </div>

            <p style={{
              fontFamily: "var(--font-body)",
              color: "rgba(232,213,245,0.5)",
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              marginBottom: "20px",
              textTransform: "uppercase",
            }}>Step 2 — Prove your Rose</p>

            <button
              className="btn-neon btn-gold"
              onClick={() => checkAccess(account)}
              disabled={isChecking}
            >
              {isChecking ? "Consulting the garden..." : "✦ Check Access"}
            </button>

            {/* Server denied access */}
            {accessError && (
              <div style={{ marginTop: "24px" }}>
                <p style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--rose)",
                  fontSize: "1rem",
                  marginBottom: "12px",
                }}>
                  🥀 {accessError}
                </p>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "rgba(232,213,245,0.4)",
                  fontSize: "0.9rem",
                }}>
                  You must own the Crimson Rose to enter this garden.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Granted — brief flash before App.jsx switches to HomePage */}
        {isAuthorized && (
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.9rem",
            letterSpacing: "0.2em",
            color: "var(--lily)",
            textShadow: "0 0 20px var(--lily-glow)",
          }}>
            ✦ {accessMessage} ✦
          </p>
        )}
      </div>

      <style>{`
        @keyframes roseGlow {
          0%,100% { filter: drop-shadow(0 0 20px rgba(232,65,122,0.8)); }
          50% { filter: drop-shadow(0 0 40px rgba(232,65,122,1)) drop-shadow(0 0 80px rgba(232,65,122,0.4)); }
        }
      `}</style>
    </div>
  );
}
```

**Key design decisions:**

- The gate is a single centred card — focused, minimal, no distractions. The full garden reveal happens after access is granted, which makes it feel earned.
- Two clear steps are shown: connect wallet first, then check access. The second step only appears after the first is complete. This prevents user confusion.
- The "Check Access" button becomes disabled and shows "Consulting the garden..." while the server is responding — never leave a user clicking a button with no feedback.
- `accessError` shows the server's denial message plus a human-readable explanation. "No NFT found" alone is confusing — we add context.

---

## STEP 12 — Update `ContractWriter.jsx` (Lily Only)

**Why update it?** The original writer had buttons for Rose, Lily, and Both. But in the new flow, anyone on the HomePage already owns a Rose (the server confirmed it). Minting a second Rose would fail anyway because your contract prevents it. So we remove the Rose and Both buttons — the page now only shows lily minting.

This is also simpler and less confusing for the user.

Replace `src/components/ContractWriter.jsx`:

```jsx
import { useState } from "react";
import { ethers } from "ethers";

// Rose owners only reach this component — so we only show lily minting
export default function ContractWriter({ contract, isConnected, onSuccess }) {
  const [lilyAmount, setLilyAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  async function mintLily() {
    if (!contract || !isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      // mintLily(amount) is payable — 0.005 ETH per lily
      const price = ethers.parseEther("0.005") * BigInt(lilyAmount);
      const tx = await contract.mintLily(lilyAmount, { value: price });

      setTxHash(tx.hash);
      await tx.wait();

      // Tell HomePage to refresh the balance display
      if (onSuccess) onSuccess();

    } catch (err) {
      if (err.code === "ACTION_REJECTED") setError("Transaction rejected in MetaMask.");
      else if (err.code === "INSUFFICIENT_FUNDS") setError("Not enough ETH for gas.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Lily amount selector */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontFamily: "var(--font-body)", color: "var(--lily)", fontSize: "16px" }}>
          How many Lilies?
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3, 5, 10].map((n) => (
            <button key={n} onClick={() => setLilyAmount(n)} style={{
              background: lilyAmount === n ? "var(--lily)" : "transparent",
              color: lilyAmount === n ? "var(--night)" : "var(--lily)",
              border: "1px solid var(--lily)",
              borderRadius: "2px", width: "36px", height: "36px",
              cursor: "pointer", fontFamily: "var(--font-body)",
              fontSize: "16px", transition: "all 0.2s",
            }}>{n}</button>
          ))}
        </div>
      </div>

      <button
        className="btn-neon btn-lily"
        onClick={mintLily}
        disabled={loading || !isConnected}
      >
        {loading ? "Minting..." : `✦ Mint ${lilyAmount} Lily — ${(0.005 * lilyAmount).toFixed(3)} ETH`}
      </button>

      {txHash && (
        <p style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--gold)", fontSize: "14px" }}>
          ✦ Transaction sent —{" "}
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
            style={{ color: "var(--gold)", textDecoration: "underline" }}>
            View on Etherscan
          </a>
        </p>
      )}
      {error && (
        <p style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--rose)", fontSize: "14px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## STEP 13 — Update `ContractReader.jsx` (Lily Balance Only)

**Why update it?** On the HomePage, the user already has a Rose — showing the Rose balance is unnecessary. We simplify it to only show the Lily balance count, keeping the navbar clean.

Replace `src/components/ContractReader.jsx`:

```jsx
import { useState, useEffect } from "react";

// Shows only Lily balance — Rose owners already know they have a Rose
export default function ContractReader({ contract, account }) {
  const [lilyBalance, setLilyBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchBalance() {
    if (!contract || !account) return;
    try {
      setIsLoading(true);
      // Token ID 1 = LILY
      const lily = await contract.balanceOf(account, 1);
      setLilyBalance(lily.toString());
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchBalance(); }, [contract, account]);

  if (!account) return null;

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      {isLoading ? (
        <span style={{ color: "var(--violet-light)", fontSize: "13px" }}>...</span>
      ) : (
        <div style={{
          fontFamily: "var(--font-body)", fontSize: "14px",
          color: "var(--lily)", textShadow: "0 0 8px var(--lily-glow)",
          border: "1px solid rgba(126,255,212,0.25)",
          padding: "6px 12px", borderRadius: "2px", letterSpacing: "0.05em",
        }}>
          🌿 {lilyBalance ?? "—"} Lilies
        </div>
      )}
      <button onClick={fetchBalance} style={{
        background: "none", border: "none", color: "var(--violet-light)",
        cursor: "pointer", fontSize: "12px", opacity: 0.7,
      }}>↻</button>
    </div>
  );
}
```

---

## STEP 14 — Update `HomePage.jsx` (Lily Minting Only)

**Why update it?** The HomePage no longer needs to explain what a Rose is or offer Rose minting — the user has one. We remove the Rose and Both NFT cards and the Rose mint button. The page now focuses entirely on the lily garden experience.

Update the NFT cards section inside `src/pages/HomePage.jsx` — replace the three-card grid and the ContractWriter section:

```jsx
{/* Replace the old three-card grid with this two-card grid */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "48px" }}>
  <NftCard
    emoji="🌿"
    name="The Moonlit Lily"
    desc="Delicate as starlight, each lily you mint adds to your eternal garden. No limit — fill it as you wish."
    price="0.005 ETH each"
    color="var(--lily)"
    glow="var(--lily-glow)"
    max="10,000 max supply"
  />
  <NftCard
    emoji="🌹"
    name="The Crimson Rose"
    desc="You already hold the sacred Rose. It grants you permanent access to this garden."
    price="Already yours"
    color="var(--rose)"
    glow="var(--rose-glow)"
    max="Exclusive — 1 per wallet"
  />
</div>

{/* Mint card — lily only now */}
<div className="card-mystical" style={{ padding: "40px" }}>
  <p style={{
    fontFamily: "var(--font-body)", fontStyle: "italic",
    color: "rgba(232,213,245,0.5)", marginBottom: "24px", fontSize: "1rem",
  }}>
    ✦ Your Rose grants you unlimited lily minting
  </p>
  <ContractWriter contract={contract} isConnected={isConnected} onSuccess={handleMintSuccess} />
</div>
```

---

## STEP 15 — Update `App.jsx` (Gate Logic)

**Why this is the most important change:** App.jsx is now the gatekeeper. It holds the `isAuthorized` state from `useAccess`. Based on that single boolean it decides which page to render — GatePage or HomePage. This is called **conditional rendering at the router level**.

Replace `src/App.jsx`:

```jsx
import { useContract } from "./hooks/useContract";
import { useAccess } from "./hooks/useAccess";
import ParticleField from "./components/ParticleField";
import GatePage from "./pages/GatePage";
import HomePage from "./pages/HomePage";

function App() {
  // Blockchain connection — called once, shared everywhere
  const { contract, account, isConnected, error, connectWallet } = useContract();

  // Server access check — called once, controls which page shows
  const { isAuthorized, isChecking, accessMessage, accessError, checkAccess } = useAccess();

  return (
    <>
      {/* Sparkles always visible — on both gate and garden */}
      <ParticleField />

      {/* THE GATE — if not authorized, show GatePage */}
      {!isAuthorized && (
        <GatePage
          account={account}
          isConnected={isConnected}
          error={error}
          connectWallet={connectWallet}
          isAuthorized={isAuthorized}
          isChecking={isChecking}
          accessMessage={accessMessage}
          accessError={accessError}
          checkAccess={checkAccess}
        />
      )}

      {/* THE GARDEN — only shown after server confirms Rose ownership */}
      {isAuthorized && (
        <HomePage
          contract={contract}
          account={account}
          isConnected={isConnected}
          error={error}
          connectWallet={connectWallet}
        />
      )}
    </>
  );
}

export default App;
```

**Why not use an `if/else`?** We could, but having both blocks visible in JSX makes it obvious at a glance what the two states are. Both blocks are readable in one scroll. An if/else would require reading into the function body.

**Why does `isAuthorized` start as `false`?** Because we defined it that way in `useAccess.js` — `useState(false)`. Nobody is authorized until the server says so. This is the secure default — deny first, grant only on confirmation.

---

## STEP 16 — Run Everything

**Order matters.** Start the server first, then the frontend.

```bash
# Terminal 1 — your Express server
node server.js
# You should see: Server running on http://localhost:3000

# Terminal 2 — your Vite frontend
npm run dev
# You should see: VITE ready on http://localhost:5173
```

---

## WHAT YOU SHOULD SEE (Full Flow)

**Without a Rose:**
1. Gate page appears — dark card with glowing rose emoji
2. Click "Connect Wallet" → MetaMask opens → connect
3. Your address appears, "Check Access" button shows
4. Click "Check Access" → button shows "Consulting the garden..."
5. Server responds → "🥀 No NFT found" appears
6. Garden stays locked

**With a Rose:**
1. Same steps 1–4
2. Server responds → "✦ Access Granted ✦" flashes
3. Page transitions to the full garden homepage
4. Navbar shows your lily balance
5. Lily mint buttons are active
6. Mint lilies, balance updates after each transaction

---

## COMPLETE CONCEPTS TABLE

| Concept | What it means | Where we used it |
|---------|--------------|-----------------|
| CSS Variables | Colours defined once, used everywhere | `index.css :root` |
| Design tokens | Single source of truth for your design system | All `var(--rose)`, `var(--lily)` etc |
| Glassmorphism | Frosted glass effect on cards | `.card-mystical` backdrop-filter |
| Parallax | Elements moving at different speeds | Rose SVG mouse tracking |
| Canvas animation | Drawing frames with requestAnimationFrame | ParticleField |
| Prop drilling | Passing state down through components | App → pages → components |
| Callback props | Child telling parent something happened | `onSuccess` in ContractWriter |
| React key trick | Changing `key` forces a component to remount | `key={refreshKey}` on ContractReader |
| React Fragment | Grouping elements without extra DOM nodes | `<>` in App.jsx |
| Conditional rendering | Showing different UI based on state | `!isAuthorized` gate in App.jsx |
| Secure default | Deny access until server explicitly grants it | `useState(false)` in useAccess |
| Separation of concerns | Each hook/file has exactly one job | useContract vs useAccess |
| Server-side verification | Access checks that cannot be bypassed in browser | Express `/verify-nft` endpoint |
| CORS | Allows two different ports to communicate | `app.use(cors(...))` in server |
| fetch API | Built-in browser tool for HTTP requests | `fetch()` in useAccess.js |