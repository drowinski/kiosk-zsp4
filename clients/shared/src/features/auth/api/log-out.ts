import { useQueryClient } from '@tanstack/react-query';
import { clearAuthToken } from '@kiosk-zsp4/shared/features/auth/utils/token';

export function useLogOut() {
  const queryClient = useQueryClient();

  const logOut = async () => {
    clearAuthToken();
    await queryClient.resetQueries();
  };

  return { logOut };
}
