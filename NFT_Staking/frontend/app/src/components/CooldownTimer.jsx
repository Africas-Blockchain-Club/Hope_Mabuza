import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CooldownTimer({ coolEnd, cooldownOver }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [pct, setPct]           = useState(0);
  const barRef = useRef();

  useEffect(() => {
    if (!coolEnd) return;
    const TOTAL = 5 * 60 * 1000;
    function tick() {
      const remaining = Math.max(0, coolEnd - Date.now());
      setPct(Math.min(100, ((TOTAL - remaining) / TOTAL) * 100));
      if (remaining === 0) { setTimeLeft("Ready"); return; }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m}:${String(s).padStart(2, "0")}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [coolEnd]);

  useEffect(() => {
    if (barRef.current)
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.8, ease: "power2.out" });
  }, [pct]);

  if (!coolEnd && cooldownOver) {
    return (
      <p className="flex items-center justify-center gap-2 text-sm"
        style={{ color: "rgba(80,200,120,0.8)", fontFamily: "DM Sans, sans-serif" }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
          style={{ background: "rgba(80,200,120,0.8)" }} />
        Ready to unstake &amp; claim
      </p>
    );
  }

  return (
    <div className="text-center mx-auto w-full max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: "rgba(120,160,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
          {cooldownOver ? "Cooldown complete" : "Cooldown"}
        </span>
        <span className="font-mono text-sm font-semibold"
          style={{ color: cooldownOver ? "rgba(80,200,120,0.8)" : "rgba(240,170,60,0.8)", fontFamily: "JetBrains Mono, monospace" }}>
          {cooldownOver ? "Ready" : timeLeft}
        </span>
      </div>
      <div className="w-full rounded-full" style={{ height: "2px", background: "rgba(255,255,255,0.07)" }}>
        <div ref={barRef} className="h-full rounded-full" style={{
          width: "0%",
          background: cooldownOver ? "rgba(80,200,120,0.6)" : "rgba(240,170,60,0.5)",
        }} />
      </div>
      <p className="text-xs mt-2" style={{ color: "rgba(120,160,255,0.3)", fontFamily: "DM Sans, sans-serif" }}>
        {cooldownOver ? "You can now unstake." : "5 minutes required before unstaking."}
      </p>
    </div>
  );
}
