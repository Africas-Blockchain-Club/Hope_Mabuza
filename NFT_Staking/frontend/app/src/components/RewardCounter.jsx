import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function RewardCounter({ pending, balance }) {
  const valRef = useRef();
  const prev   = useRef(0);

  useEffect(() => {
    const next = parseFloat(pending) || 0;
    if (next === prev.current) return;
    gsap.to({ val: prev.current }, {
      val: next, duration: 1, ease: "power2.out",
      onUpdate: function () {
        if (valRef.current) valRef.current.textContent = this.targets()[0].val.toFixed(3);
      },
      onComplete: () => { prev.current = next; },
    });
  }, [pending]);

  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center gap-3 mb-2">
        <span ref={valRef} className="font-mono font-bold"
          style={{ fontSize: "64px", color: "#c8d8ff", lineHeight: 1, fontFamily: "JetBrains Mono, monospace" }}>
          {parseFloat(pending || 0).toFixed(3)}
        </span>
        <span className="text-2xl font-medium" style={{ color: "rgba(120,160,255,0.45)", fontFamily: "DM Sans, sans-serif" }}>GLXY</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "rgba(80,200,120,0.8)", fontFamily: "DM Sans, sans-serif" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
            style={{ background: "rgba(80,200,120,0.8)" }} />
          live
        </span>
      </div>
      <p className="text-xs" style={{ color: "rgba(120,160,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
        Wallet — {balance ?? "0"} GLXY
      </p>
    </div>
  );
}
