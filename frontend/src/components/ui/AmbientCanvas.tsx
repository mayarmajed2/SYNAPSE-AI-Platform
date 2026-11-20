import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  alpha: number;
  color: string;
}

const PALETTE = [
  "255, 77, 141",  // Sunset Coral Pink
  "124, 92, 255",  // Royal Iris Violet
  "56, 189, 248",  // Luminous Sky Cyan
  "251, 146, 60",  // Warm Amber Gold
];

/**
 * Interactive 60fps Multi-Hue Neural Constellation Background
 * - Drifting colorful synaptic nodes that connect smoothly
 * - Mouse cursor attracts nearby nodes with glowing multi-hue filaments
 * - Clicking anywhere fires a synaptic energy ripple wave!
 */
export const AmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -9999, y: -9999, active: false };
    const NODE_COUNT = Math.min(68, Math.max(32, Math.floor((width * height) / 22000)));
    const LINK_DIST = 155;
    const MOUSE_DIST = 210;

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.52,
      vy: (Math.random() - 0.5) * 0.52,
      r: Math.random() * 1.9 + 1.2,
      color: PALETTE[i % PALETTE.length],
    }));

    const ripples: Ripple[] = [];

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    const onClick = (e: MouseEvent) => {
      if (prefersReduced) return;
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 8,
        alpha: 0.55,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      });
      // Give nearby nodes a playful kinetic nudge
      for (const n of nodes) {
        const dx = n.x - e.clientX;
        const dy = n.y - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 1) {
          n.vx += (dx / dist) * 0.9;
          n.vy += (dy / dist) * 0.9;
        }
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick, { passive: true });

    let rafId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Luminous cursor spotlight halo
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
        grad.addColorStop(0, "rgba(124, 92, 255, 0.12)");
        grad.addColorStop(0.5, "rgba(255, 77, 141, 0.06)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Synaptic click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 4.2;
        rp.alpha *= 0.94;
        if (rp.alpha < 0.015) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(${rp.color}, ${rp.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!prefersReduced) {
          n.x += n.vx;
          n.y += n.vy;
          // Gentle damping back to calm cruise speed
          n.vx *= 0.992;
          n.vy *= 0.992;
          if (Math.abs(n.vx) < 0.12) n.vx += (Math.random() - 0.5) * 0.06;
          if (Math.abs(n.vy) < 0.12) n.vy += (Math.random() - 0.5) * 0.06;

          if (mouse.active) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MOUSE_DIST && dist > 1) {
              n.x += (dx / dist) * 0.45;
              n.y += (dy / dist) * 0.45;
            }
          }

          if (n.x < -12) n.x = width + 12;
          if (n.x > width + 12) n.x = -12;
          if (n.y < -12) n.y = height + 12;
          if (n.y > height + 12) n.y = -12;
        }

        // Neural filaments between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < LINK_DIST) {
            const opacity = (1 - d / LINK_DIST) * 0.22;
            ctx.strokeStyle = `rgba(${n.color}, ${opacity})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        // Interactive mouse connections
        if (mouse.active) {
          const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (md < MOUSE_DIST) {
            const opacity = (1 - md / MOUSE_DIST) * 0.42;
            ctx.strokeStyle = `rgba(${n.color}, ${opacity})`;
            ctx.lineWidth = 1.15;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }

        // Glowing node core
        ctx.fillStyle = `rgba(${n.color}, 0.72)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <div className="ambient-aurora" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
};
