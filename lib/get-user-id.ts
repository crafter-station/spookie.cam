import { createHash } from 'crypto';
import { headers } from 'next/headers';

export async function getUserId() {
  const headersList = headers();

  // Get IP address
  const ip = headersList.get('x-forwarded-for') || 'unknown';

  // Get User-Agent
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Get Accept-Language
  const acceptLanguage = headersList.get('accept-language') || 'unknown';

  // Combine the information
  const combinedInfo = `${ip}|${userAgent}|${acceptLanguage}`;

  // Create a hash of the combined information
  const hash = createHash('sha256');
  hash.update(combinedInfo);
  const uniqueIdentifier = hash.digest('hex');

  return uniqueIdentifier;
}
