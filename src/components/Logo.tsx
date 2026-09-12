import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

/**
 * The mark: a shield holding a set of scales. Kavach is the shield, nyaya the
 * scales — the two words the product is named after, drawn as one object.
 */
export function Logo({ size = 36, shield, scales }: { size?: number; shield: string; scales: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Path d="M20 3 6 8v13c0 8.4 5.8 14.2 14 16 8.2-1.8 14-7.6 14-16V8L20 3z" fill={shield} />
      <Path
        d="M20 12v13M13.5 16h13M14 16l-2.4 5h4.8L14 16zM26 16l-2.4 5h4.8L26 16zM16 27h8"
        stroke={scales}
        strokeWidth={1.7}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** The shield, and the scales inside it — the mark, as two paths. */
const SHIELD_D = 'M20 3 6 8v13c0 8.4 5.8 14.2 14 16 8.2-1.8 14-7.6 14-16V8L20 3z';
const SCALES_D = 'M20 12v13M13.5 16h13M14 16l-2.4 5h4.8L14 16zM26 16l-2.4 5h4.8L26 16zM16 27h8';

/**
 * The mark again, soft and faint, to sit behind content as a watermark.
 *
 * The blur is built out of geometry rather than an SVG filter, and that is
 * deliberate: react-native-svg's FeGaussianBlur is a native-only component,
 * so on web the filter never exists and the group referencing it is dropped
 * silently — the watermark simply does not paint. Stacking the same mark at
 * growing scales and low opacity feathers the edge the same way and works
 * identically on iOS, Android and the browser.
 *
 * The layers compound, so each one stays very faint: five at 0.075 come to
 * about a third of full strength in the middle and fade to almost nothing at
 * the rim, which is what makes it read as depth instead of as a second logo.
 */
export function LogoBlur({
  size = 96,
  color,
  layers = 5,
  spread = 0.045,
  step = 0.075,
}: {
  size?: number;
  color: string;
  layers?: number;
  spread?: number;
  step?: number;
}) {
  return (
    // the viewBox is four units wider than the mark on every side, so the
    // outermost layer has room to grow into instead of being cut off square
    <Svg width={size} height={size} viewBox="-4 -4 48 48">
      {Array.from({ length: layers }, (_, i) => {
        const k = (1 + i * spread).toFixed(3);
        return (
          <G key={i} transform={`translate(20,20) scale(${k}) translate(-20,-20)`} opacity={step}>
            <Path d={SHIELD_D} fill={color} />
            <Path d={SCALES_D} stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" />
          </G>
        );
      })}
    </Svg>
  );
}

/** The same scales, alone and faint — used as a watermark on advocate surfaces. */
export function SealMark({ size = 84, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 92 92">
      <Path
        d="M46 2a44 44 0 1 1 0 88 44 44 0 0 1 0-88z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Path d="M46 10a36 36 0 1 1 0 72 36 36 0 0 1 0-72z" stroke={color} strokeWidth={1} fill="none" />
      <Path
        d="M46 26v40M32 36h28M33 36l-5 11h10L33 36zM59 36l-5 11h10L59 36zM36 70h20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
