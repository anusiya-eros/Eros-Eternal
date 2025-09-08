import React, { useRef, useEffect } from "react";

const MicVisualizer: React.FC<{ stream: MediaStream | null; height?: number }> = ({
  stream,
  height = 40,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    let prevHeights: number[] = [];
    let offset = 0; // 🔹 Shift offset for flowing motion

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = Math.floor(canvas.width / 4); // many bars across width
      const barWidth = 2;
      const gap = 2;
      const step = Math.floor(bufferLength / barCount);

      const centerY = canvas.height / 2;
      const newHeights: number[] = [];

      // 🔹 Gradient (cyan left → faded right)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#00b8f8");
      gradient.addColorStop(1, "rgba(0, 184, 248, 0.15)");

      ctx.fillStyle = gradient;

      for (let i = 0; i < barCount; i++) {
        const index = (i + offset) % bufferLength; // 🔹 Shift bars
        const value = dataArray[index] || 0;
        const rawHeight = (value / 255) * canvas.height;

        // Smooth transition
        const prev = prevHeights[i] || 0;
        const smoothed = prev + (rawHeight - prev) * 0.25;
        newHeights[i] = smoothed;

        const x = i * (barWidth + gap);
        const barHeight = smoothed;

        // Bars centered vertically
        const y = centerY - barHeight / 2;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      prevHeights = newHeights;
      offset = (offset + 1) % bufferLength; // 🔹 slowly shift left
    };

    draw();
    return () => {
      audioContext.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      style={{
        width: "100%",
        height: `${height}px`,
        background: "transparent",
      }}
    />
  );
};

export default MicVisualizer;
