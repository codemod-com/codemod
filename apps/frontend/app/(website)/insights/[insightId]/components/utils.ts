interface ChartColor {
  line: string;
  gradientStart: string;
  gradientEnd: string;
}

function hslToRgb(h: number, s: number, l: number): string {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tempT = t;

      if (tempT < 0) tempT += 1;
      if (tempT > 1) tempT -= 1;
      if (tempT < 1 / 6) return p + (q - p) * 6 * tempT;
      if (tempT < 1 / 2) return q;
      if (tempT < 2 / 3) return p + (q - p) * (2 / 3 - tempT) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export function generateChartColors(n: number): ChartColor[] {
  const hueStep = 1 / n;
  const baseHues = Array.from({ length: n }, (_, i) => i * hueStep);

  return baseHues.map((hue) => {
    const baseColor = hslToRgb(hue, 0.6, 0.5);
    const lighterColor = hslToRgb(hue, 0.6, 0.7);
    const darkerColor = hslToRgb(hue, 0.6, 0.3);

    return {
      line: baseColor,
      gradientStart: lighterColor,
      gradientEnd: darkerColor,
    };
  });
}
