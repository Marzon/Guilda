/**
 * Calculadora de contraste WCAG para cores HSL
 */

// Converter HSL para RGB
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// Calcular luminância relativa
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calcular ratio de contraste
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Verificar conformidade WCAG
export interface WCAGResult {
  ratio: number;
  AA: {
    normalText: boolean;  // 4.5:1
    largeText: boolean;   // 3:1
    uiComponents: boolean; // 3:1
  };
  AAA: {
    normalText: boolean;  // 7:1
    largeText: boolean;   // 4.5:1
  };
}

export function checkWCAGCompliance(
  foregroundHSL: string, 
  backgroundHSL: string
): WCAGResult {
  // Parse HSL strings (formato: "223 71% 6%")
  const parseHSL = (hsl: string): [number, number, number] => {
    const parts = hsl.match(/[\d.]+/g);
    if (!parts || parts.length < 3) throw new Error(`Invalid HSL: ${hsl}`);
    return [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
  };
  
  const [h1, s1, l1] = parseHSL(foregroundHSL);
  const [h2, s2, l2] = parseHSL(backgroundHSL);
  
  const rgb1 = hslToRgb(h1, s1, l1);
  const rgb2 = hslToRgb(h2, s2, l2);
  
  const lum1 = getRelativeLuminance(...rgb1);
  const lum2 = getRelativeLuminance(...rgb2);
  
  const ratio = getContrastRatio(lum1, lum2);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
      uiComponents: ratio >= 3,
    },
    AAA: {
      normalText: ratio >= 7,
      largeText: ratio >= 4.5,
    },
  };
}
