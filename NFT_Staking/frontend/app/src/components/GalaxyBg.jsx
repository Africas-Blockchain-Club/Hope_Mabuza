import { useEffect, useRef } from "react";

export default function GalaxyBg() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W, H, stars = [], raf;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = Array.from({ length: 160 }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.4 + 0.3,
        speed: Math.random() * 0.007 + 0.002,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      {/* Base — deep dark navy, matches image corners */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #060d20 0%, #030810 40%, #020610 100%)" }} />

      {/* Diagonal nebula sweep — bright electric blue aurora going bottom-left → top-right */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 90% 55% at 55% 45%,
            rgba(80,140,255,0.55) 0%,
            rgba(50,100,220,0.30) 35%,
            rgba(20,50,140,0.10) 65%,
            transparent 100%
          )
        `,
        transform: "rotate(-30deg) scale(1.4)",
      }} />

      {/* Bright core of the sweep */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 40% 25% at 52% 42%,
            rgba(160,200,255,0.30) 0%,
            rgba(100,160,255,0.12) 50%,
            transparent 100%
          )
        `,
        transform: "rotate(-30deg) scale(1.4)",
      }} />

      {/* Deep blue left-edge glow */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 60% 80% at -10% 60%,
            rgba(30,80,200,0.35) 0%,
            transparent 70%
          )
        `,
      }} />

      {/* Dark vignette corners */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 120% 120% at 50% 50%,
            transparent 40%,
            rgba(2,6,16,0.65) 100%
          )
        `,
      }} />

      {/* Twinkling stars canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
