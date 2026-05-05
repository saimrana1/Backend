import { Newsletter } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

export async function subscribe(email: string) {
  try {
    await Newsletter.create({ email });
    return { message: 'Successfully subscribed to the newsletter', email };
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000) {
      // Already subscribed — return success silently (idempotent)
      return { message: 'You are already subscribed', email };
    }
    throw e;
  }
}

export async function unsubscribe(email: string) {
  const result = await Newsletter.findOneAndDelete({ email });
  if (!result) {
    throw HttpError.notFound('Subscription');
  }
  return { message: 'Successfully unsubscribed from the newsletter', email };
}
