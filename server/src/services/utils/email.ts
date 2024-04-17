import { EmailVerificationStatus } from '../../repositories/model/emails.model.js';

export function randomTimeToProcessInSeconds(minSeconds: number = 5, maxSeconds: number = 100): number {
  const randomSeconds = (Math.random() * (maxSeconds - minSeconds)) + minSeconds;
  return Math.floor(randomSeconds);
}

export function randomEmailVerificationStatus(): string {
  const random = Math.floor(Math.random() * 2) + 1;
  return random === 1
    ? EmailVerificationStatus.Valid
    : EmailVerificationStatus.Invalid;
}

export async function fakeEmailVerificationStatus(): Promise<string> {
  const timeInSeconds = randomTimeToProcessInSeconds();

  return new Promise((resolve) => {
    setTimeout(() => {
      const status = randomEmailVerificationStatus();
      resolve(status);
    }, timeInSeconds * 1000);
  });
}
