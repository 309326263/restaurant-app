export function playDoubleBeep(
  audio: HTMLAudioElement | null
) {
  if (!audio) return undefined;

  audio.currentTime = 0;

  audio.play().catch((err) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[kitchen] audio play blocked", err);
    }
  });

  return window.setTimeout(() => {
    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[kitchen] audio second beep blocked",
          err
        );
      }
    });
  }, 180);
}
