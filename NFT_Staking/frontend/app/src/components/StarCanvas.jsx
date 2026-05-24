import { useEffect, useRef } from "react";

export default function StarCanvas() {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let W, H, raf;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function init() {
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.2,
        o: Math.random() * 0.6 + 0.1,
        phase: Math.random() * Math.PI * 2,
        color: ["#fff", "#C084FC", "#93C5FD", "#67E8F9"][Math.floor(Math.random() * 4)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        s.phase += 0.015;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.o * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    window.addEventListener("resize", () => { resize(); init(); });
    return () => { cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
