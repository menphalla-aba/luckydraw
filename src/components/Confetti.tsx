import React, { useEffect, useRef } from 'react';

// Minimal confetti animation using canvas
const Confetti: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confetti = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H - H,
      r: 6 + Math.random() * 8,
      d: 8 + Math.random() * 8,
      color: `hsl(${Math.random() * 360},90%,60%)`,
      tilt: Math.random() * 10,
      tiltAngle: 0,
    }));
    let running = true;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      confetti.forEach(c => {
        if (!ctx) return;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.r, c.r/2, c.tilt, 0, 2 * Math.PI);
        ctx.fillStyle = c.color;
        ctx.fill();
      });
    }
    function update() {
      confetti.forEach(c => {
        c.y += Math.cos(c.d) + 2 + c.r/4;
        c.x += Math.sin(c.tilt) * 2;
        c.tilt += 0.05;
        if (c.y > H) {
          c.y = -10;
          c.x = Math.random() * W;
        }
      });
    }
    function loop() {
      if (!running) return;
      draw();
      update();
      requestAnimationFrame(loop);
    }
    loop();
    return () => { running = false; };
  }, []);
  return <canvas ref={ref} className="confetti" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:2000}} />;
};
export default Confetti;
