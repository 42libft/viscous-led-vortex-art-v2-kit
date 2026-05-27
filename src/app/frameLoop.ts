export type FrameInfo = {
  nowMs: number;
  dtMs: number;
};

export type FrameCallback = (info: FrameInfo) => void;

export type FrameLoop = {
  start: () => void;
  stop: () => void;
};

export function createFrameLoop(onFrame: FrameCallback): FrameLoop {
  let rafId: number | null = null;
  let lastNowMs: number | null = null;

  const frame = (nowMs: number) => {
    rafId = requestAnimationFrame(frame);
    const dtMs = lastNowMs === null ? 0 : nowMs - lastNowMs;
    lastNowMs = nowMs;
    onFrame({ nowMs, dtMs });
  };

  const start = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
    lastNowMs = null;
  };

  return { start, stop };
}

