import { useEffect, useRef } from 'react';

interface PixelPlasmaProps {
  animate?: boolean;
}

export function PixelPlasma({ animate = true }: PixelPlasmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Higher resolution for smoother blob edges while maintaining pixel aesthetic
    const res = 128; 
    canvas.width = res;
    canvas.height = res;

    let animationFrameId: number;
    let time = 0;

    // Metaballs / Distance-based plasma (drifting, merging blobs)
    function blob(x: number, y: number, cx: number, cy: number, r: number) {
      const dx = x - cx;
      const dy = y - cy;
      return r / Math.sqrt(dx * dx + dy * dy);
    }

    const render = () => {
      // Slightly slower animation for a mesmerizing effect
      time += 0.03;

      const imageData = ctx.createImageData(res, res);
      const data = imageData.data;

      // Calculate blob centers that move in elliptical/lissajous patterns
      // Mapping from 0-res range
      const b1x = (Math.sin(time * 0.5) * 0.4 + 0.5) * res;
      const b1y = (Math.cos(time * 0.3) * 0.4 + 0.5) * res;
      
      const b2x = (Math.sin(time * 0.2 + 2) * 0.4 + 0.5) * res;
      const b2y = (Math.cos(time * 0.4 + 1) * 0.4 + 0.5) * res;

      const b3x = (Math.sin(time * 0.6 + 4) * 0.3 + 0.5) * res;
      const b3y = (Math.cos(time * 0.5 + 3) * 0.3 + 0.5) * res;

      const blobRadius = 15; // Controls the "thickness" of the blobs

      for (let y = 0; y < res; y++) {
        for (let x = 0; x < res; x++) {
          
          // Sum the influence of the blobs
          let v = blob(x, y, b1x, b1y, blobRadius) 
                + blob(x, y, b2x, b2y, blobRadius)
                + blob(x, y, b3x, b3y, blobRadius * 0.8);

          // Add a very subtle base sine wave just to keep the background alive
          v += (Math.sin(x * 0.05 + time) + Math.sin(y * 0.05 - time)) * 0.1;

          let r = 0, g = 0, b = 0;

          // Thresholding the value creates the sharp edges/blobs that merge
          // The color gradient depends on how 'intense' the influence is
          if (v > 1.2) {
            // Hot center of the blobs (Fuchsia)
            r = 192; g = 38; b = 211;
          } else if (v > 0.8) {
            // Mid-tier blob (Blue)
            r = 37; g = 99; b = 235;
          } else {
            // Deep background (Deep Purple)
            r = 88; g = 28; b = 135;
          }

          const index = (y * res + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 60; // Slightly higher opacity for visibility
        }
      }

      ctx.putImageData(imageData, 0, 0);

      if (animate) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000"
      style={{ 
        imageRendering: 'auto', // Changed from pixelated for smooth blending
        filter: 'blur(2px)' // Slight blur hides any remaining pixel grid from the low-res generation
      }}
    />
  );
}
