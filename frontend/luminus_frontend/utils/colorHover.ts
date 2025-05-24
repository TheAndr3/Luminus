export function darkenHexColor(hex: any, amount = 20) {
  let col = hex.startsWith('#') ? hex.slice(1) : hex;

  const r = Math.max(0, parseInt(col.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(col.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(col.substring(4, 6), 16) - amount);

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}