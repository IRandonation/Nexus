const FALLBACK_TOPIC_COLOR = '#64748B';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const toHex = (value: number): string => {
  return Math.round(value).toString(16).padStart(2, '0');
};

const parseHexColor = (input: string): RgbColor | null => {
  const normalized = input.trim().replace('#', '');
  const hex = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const rgbToHsl = ({ r, g, b }: RgbColor): { h: number; s: number; l: number } => {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === nr) {
      h = ((ng - nb) / delta) % 6;
    } else if (max === ng) {
      h = (nb - nr) / delta + 2;
    } else {
      h = (nr - ng) / delta + 4;
    }
  }

  return {
    h: (h * 60 + 360) % 360,
    s,
    l,
  };
};

const hslToRgb = (h: number, s: number, l: number): RgbColor => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: (rPrime + m) * 255,
    g: (gPrime + m) * 255,
    b: (bPrime + m) * 255,
  };
};

export const normalizeTopicColor = (input: string): string => {
  const rawColor = parseHexColor(input) ?? parseHexColor(FALLBACK_TOPIC_COLOR);
  if (!rawColor) {
    return FALLBACK_TOPIC_COLOR;
  }

  const { h, s, l } = rgbToHsl(rawColor);
  const adjustedSaturation = Math.min(s, 0.24);
  const adjustedLightness = clamp(l, 0.42, 0.62);
  const adjusted = hslToRgb(h, adjustedSaturation, adjustedLightness);

  return `#${toHex(adjusted.r)}${toHex(adjusted.g)}${toHex(adjusted.b)}`.toUpperCase();
};

export const withAlpha = (input: string, alpha: number): string => {
  const normalized = parseHexColor(normalizeTopicColor(input));
  if (!normalized) {
    return `rgba(100, 116, 139, ${clamp(alpha, 0, 1).toFixed(2)})`;
  }

  return `rgba(${normalized.r}, ${normalized.g}, ${normalized.b}, ${clamp(alpha, 0, 1).toFixed(2)})`;
};
