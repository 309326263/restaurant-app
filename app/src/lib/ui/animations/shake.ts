export const shakeAnimation = `
  animate-[tableShake_420ms_ease]
`;

export const shakeKeyframes = `
@keyframes tableShake {
  0% {
    transform: translateY(0px);
  }

  20% {
    transform: translateY(-2px);
  }

  40% {
    transform: translateY(1px);
  }

  60% {
    transform: translateY(-1px);
  }

  80% {
    transform: translateY(1px);
  }

  100% {
    transform: translateY(0px);
  }
}
`;