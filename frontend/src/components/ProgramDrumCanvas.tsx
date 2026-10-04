"use client";

import { useEffect, useRef } from "react";

interface ProgramDrumCanvasProps {
  colIdx: number;
  progControl: boolean;
}

export default function ProgramDrumCanvas({ colIdx, progControl }: ProgramDrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#0a0c0e";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const radius = width / 2 - 14;
    const topY = 8;
    const drumHeight = height - 16;
    const baseAngle = (colIdx / 80) * 2 * Math.PI;

    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      if (Math.abs(dx) > radius) continue;

      const theta = Math.asin(dx / radius);
      const cardAngle = (baseAngle + theta + 100 * Math.PI) % (2 * Math.PI);
      const colOnCard = (cardAngle / (2 * Math.PI)) * 80;

      const diffuse = Math.max(0.18, Math.cos(theta - 0.3));
      const specular = Math.pow(Math.max(0, Math.cos(theta - 0.2)), 6) * 45;

      let r = Math.min(255, 222 * diffuse + specular);
      let g = Math.min(255, 208 * diffuse + specular);
      let b = Math.min(255, 175 * diffuse + specular);

      const distToSeam = Math.min(colOnCard, 80 - colOnCard);
      if (distToSeam < 1.4) {
        const metalShine = Math.sin(theta * 3.5 + 1.2);
        const chrome = Math.min(255, 150 * diffuse + 80 * metalShine);
        r = chrome;
        g = chrome + 4;
        b = chrome + 8;
      }

      ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      ctx.fillRect(x, topY, 1, drumHeight);

      const isColHole = Math.abs(colOnCard - Math.round(colOnCard)) < 0.22;
      const colNum = Math.round(colOnCard);

      if (isColHole && distToSeam >= 1.4) {
        const hasRow12 = [1, 6, 7, 73].includes(colNum);
        const hasRow11 = (colNum >= 2 && colNum <= 5) || (colNum >= 73 && colNum <= 80);

        ctx.fillStyle = `rgba(14, 18, 22, ${0.9 * diffuse})`;
        if (hasRow12) ctx.fillRect(x, topY + 18, 1, 7);
        if (hasRow11) ctx.fillRect(x, topY + 40, 1, 7);
      }
    }

    const collarGrad = ctx.createLinearGradient(0, 0, width, 0);
    collarGrad.addColorStop(0, "#181d22");
    collarGrad.addColorStop(0.35, "#7a8a96");
    collarGrad.addColorStop(0.65, "#d2dce3");
    collarGrad.addColorStop(1, "#181d22");

    ctx.fillStyle = collarGrad;
    ctx.fillRect(centerX - radius - 2, topY - 3, (radius + 2) * 2, 4);
    ctx.fillRect(centerX - radius - 2, topY + drumHeight - 1, (radius + 2) * 2, 4);

    const vignette = ctx.createLinearGradient(centerX - radius, 0, centerX + radius, 0);
    vignette.addColorStop(0, "rgba(0,0,0,0.88)");
    vignette.addColorStop(0.15, "rgba(0,0,0,0.25)");
    vignette.addColorStop(0.5, "rgba(0,0,0,0)");
    vignette.addColorStop(0.85, "rgba(0,0,0,0.25)");
    vignette.addColorStop(1, "rgba(0,0,0,0.88)");

    ctx.fillStyle = vignette;
    ctx.fillRect(centerX - radius, topY, radius * 2, drumHeight);

    ctx.strokeStyle = "rgba(110, 90, 60, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - radius, topY + 30);
    ctx.lineTo(centerX + radius, topY + 30);
    ctx.moveTo(centerX - radius, topY + drumHeight - 22);
    ctx.lineTo(centerX + radius, topY + drumHeight - 22);
    ctx.stroke();

  }, [colIdx, progControl]);

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={120}
      className="rounded-[2px] shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)]"
    />
  );
}