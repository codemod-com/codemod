"use client";

import { cn } from "@/utils";
import createGlobe, { type COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { useThemeDetector } from "../hooks";

const LIGHT_THEME_CONFIG: Partial<COBEOptions> = {
  dark: 0,
  baseColor: [255 / 255, 255 / 255, 255 / 255], // #FFF in normalized RGB
  markerColor: [137 / 255, 185 / 255, 0 / 255], // #89B900 in normalized RGB
  glowColor: [247 / 255, 255 / 255, 223 / 255], // #F7FFDF in normalized RGB
};

const DARK_THEME_CONFIG: Partial<COBEOptions> = {
  dark: 1,
  baseColor: [53 / 255, 69 / 255, 85 / 255], // #354555 in normalized RGB
  markerColor: [214 / 255, 255 / 255, 98 / 255], // #D6FF62 in normalized RGB
  glowColor: [12 / 255, 22 / 255, 31 / 255], // #0C161F in normalized RGB
};

const GLOBE_CONFIG: Partial<COBEOptions> = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  diffuse: 1.75,
  mapSamples: 16000,
  mapBrightness: 7,
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: Partial<COBEOptions>;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);
  const theme = useThemeDetector();

  // Dynamically apply theme-based config
  const _config = {
    ...(theme === "dark" ? DARK_THEME_CONFIG : LIGHT_THEME_CONFIG),
    ...config,
  } as COBEOptions;

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005;
      state.phi = phi + r;
      state.width = width * 2;
      state.height = width * 2;
    },
    [r],
  );

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ..._config,
      width: width * 2,
      height: width * 2,
      onRender,
    });

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 300);
    return () => globe.destroy();
  }, [_config]);

  return (
    <div className={cn("mx-auto aspect-[1/1] w-full max-w-[600px]", className)}>
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}
