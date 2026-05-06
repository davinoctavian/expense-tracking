import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";

const sizes = [192, 512];

mkdirSync("public/icons", { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#2563eb";
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Emoji
  ctx.font = `${size * 0.5}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("💸", size / 2, size / 2);

  writeFileSync(`public/icons/icon-${size}x${size}.png`, canvas.toBuffer());
  console.log(`Created icon-${size}x${size}.png`);
}
