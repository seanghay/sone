import { useEffect, useRef } from 'react';

// Subtle drifting dots painted on a 2D canvas behind the hero copy.
// Kept intentionally low-density (~36 particles), faint (alpha 0.15–0.36),
// and slow (max velocity 0.12 px/frame) so it reads as ambient depth, not
// motion that competes with the headline. Honors prefers-reduced-motion.
export function HeroParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      peakAlpha: number;
      life: number;
      lifespan: number;
    };

    const COUNT = 100;
    const particles: Particle[] = [];

    type Shooting = {
      active: boolean;
      x: number;
      y: number;
      vx: number;
      vy: number;
      tail: number;
      life: number;
      lifespan: number;
    };
    const SHOOTING_MAX = 2;
    const shootingStars: Shooting[] = [];
    for (let i = 0; i < SHOOTING_MAX; i++) {
      shootingStars.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        tail: 0,
        life: 0,
        lifespan: 0,
      });
    }
    // First shooting star within ~2–8 seconds; thereafter every ~4–12 s.
    let nextShootingIn = 120 + Math.floor(Math.random() * 360);

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let tick = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(p: Particle) {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = reduceMotion ? 0 : (Math.random() - 0.5) * 0.08;
      p.vy = reduceMotion ? 0 : (Math.random() - 0.5) * 0.08;
      p.r = 0.6 + Math.random() * 1.1;
      p.peakAlpha = 0.32 + Math.random() * 0.32;
      p.life = 0;
      // ~4–10 seconds at 60fps
      p.lifespan = 240 + Math.random() * 360;
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const p = {} as Particle;
        spawn(p);
        // Stagger initial life so the field isn't all-on at t=0
        p.life = Math.random() * p.lifespan;
        particles.push(p);
      }
    }

    function color(): string {
      return document.documentElement.classList.contains('dark')
        ? '255, 255, 255'
        : '0, 0, 0';
    }

    // Soft radial-gradient "blobs" drifting in slow elliptical paths.
    // Modern ambient-glow look (Linear/Vercel-style), tied to Sone's
    // blue→cyan brand ramp so it picks up the same hues as the headline
    // gradient. Light mode uses deeper, more saturated hues; dark mode
    // shifts to a luminous variant so the blobs read against the dark
    // background without becoming muddy.
    type Blob = {
      cx: number; // 0..1 of width
      cy: number; // 0..1 of height
      r: number; // px (gradient radius)
      hueLight: string; // "r, g, b"
      hueDark: string;
      amp: number; // px elliptical drift radius
      speed: number; // radians per tick
      phase: number;
    };
    const blobs: Blob[] = [
      {
        cx: 0.22,
        cy: 0.45,
        r: 380,
        hueLight: '46, 28, 255',
        hueDark: '110, 130, 255',
        amp: 90,
        speed: 0.0006,
        phase: 0,
      },
      {
        cx: 0.78,
        cy: 0.4,
        r: 420,
        hueLight: '0, 200, 255',
        hueDark: '110, 230, 255',
        amp: 110,
        speed: -0.0005,
        phase: Math.PI * 0.7,
      },
      {
        cx: 0.55,
        cy: 0.78,
        r: 320,
        hueLight: '120, 60, 255',
        hueDark: '170, 140, 255',
        amp: 70,
        speed: 0.0008,
        phase: Math.PI,
      },
    ];

    function spawnShooting() {
      const s = shootingStars.find((x) => !x.active);
      if (!s) return;
      s.active = true;
      // Cross diagonally — start above the canvas, head into one of the
      // bottom corners. Random side, mild angle variation.
      const goingRight = Math.random() < 0.5;
      const speed = 6 + Math.random() * 4;
      const angleDeg = 20 + Math.random() * 25; // 20–45° from horizontal
      const rad = (angleDeg * Math.PI) / 180;
      s.vx = goingRight ? Math.cos(rad) * speed : -Math.cos(rad) * speed;
      s.vy = Math.sin(rad) * speed;
      // Start above the canvas, biased toward the upper edge of the
      // opposite corner from where it's heading.
      s.x = goingRight
        ? Math.random() * width * 0.5 - 60
        : width * 0.5 + Math.random() * width * 0.5 + 60;
      s.y = -40 - Math.random() * 40;
      s.tail = 80 + Math.random() * 80;
      s.life = 0;
      s.lifespan = 80 + Math.floor(Math.random() * 50);
    }

    function drawShootingStars(c: string) {
      if (!ctx) return;
      for (const s of shootingStars) {
        if (!s.active) continue;
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;
        const offscreen =
          s.x < -120 || s.x > width + 120 || s.y > height + 120;
        if (s.life >= s.lifespan || offscreen) {
          s.active = false;
          continue;
        }
        const progress = s.life / s.lifespan;
        // Fast in, slower out — feels like a real streak.
        const envelope =
          progress < 0.15
            ? progress / 0.15
            : 1 - ((progress - 0.15) / 0.85) ** 1.6;
        if (envelope < 0.02) continue;

        const speed = Math.hypot(s.vx, s.vy);
        const ux = s.vx / speed;
        const uy = s.vy / speed;
        const tailX = s.x - ux * s.tail;
        const tailY = s.y - uy * s.tail;

        // Streak — bright at the head, transparent at the tail.
        const grd = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grd.addColorStop(0, `rgba(${c}, ${0.85 * envelope})`);
        grd.addColorStop(1, `rgba(${c}, 0)`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Tiny glow at the head.
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 5);
        glow.addColorStop(0, `rgba(${c}, ${envelope})`);
        glow.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(s.x - 6, s.y - 6, 12, 12);
      }
    }

    function drawBlobs() {
      if (!ctx) return;
      const isDark = document.documentElement.classList.contains('dark');
      const peak = isDark ? 0.1 : 0.09;
      const mid = isDark ? 0.03 : 0.025;
      for (const b of blobs) {
        const t = reduceMotion ? 0 : tick * b.speed + b.phase;
        const cx = b.cx * width + Math.cos(t) * b.amp;
        const cy = b.cy * height + Math.sin(t) * b.amp * 0.6;
        const hue = isDark ? b.hueDark : b.hueLight;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        grd.addColorStop(0, `rgba(${hue}, ${peak})`);
        grd.addColorStop(0.55, `rgba(${hue}, ${mid})`);
        grd.addColorStop(1, `rgba(${hue}, 0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }
    }

    function frame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const c = color();
      tick++;
      drawBlobs();

      if (!reduceMotion) {
        nextShootingIn -= 1;
        if (nextShootingIn <= 0) {
          spawnShooting();
          nextShootingIn = 240 + Math.floor(Math.random() * 480);
        }
      }
      drawShootingStars(c);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        // Lifecycle: 0 → fade in → peak → fade out → respawn at random spot.
        // Smooth bell curve via sin(progress * π).
        if (p.life >= p.lifespan) {
          spawn(p);
          continue;
        }
        const progress = p.life / p.lifespan;
        const envelope = Math.sin(progress * Math.PI);
        const alpha = p.peakAlpha * envelope;
        if (alpha < 0.005) continue;
        // Scale radius along the same envelope so the dot pops in, peaks,
        // and shrinks back out instead of just changing opacity.
        const radius = p.r * envelope;
        if (radius < 0.05) continue;

        ctx.fillStyle = `rgba(${c}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    init();
    frame();

    const ro = new ResizeObserver(() => {
      resize();
      // re-seed on big resizes so particles don't all bunch in old bounds
      init();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full -z-10"
    />
  );
}
