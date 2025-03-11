import { userRepository } from '@/features/users/users.repository';

export async function requireSuperuser(userId: number | undefined) {
  if (!userId) {
    throw new Response(null, { status: 401, statusText: 'Unauthorized' });
  }
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Response(null, { status: 401, statusText: 'Unauthorized' });
  }
  if (!user.isSuperuser) {
    throw new Response(null, { status: 403, statusText: 'Forbidden' });
  }
}
