import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});

export const hasLimitReached = async (identifier: string) => {
  try {
    const { success } = await ratelimit.limit(identifier);
    return !success;
  } catch (error) {
    console.error(error);
    return true;
  }
};
