import React from 'react';
import Svg, { Path } from 'react-native-svg';

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
