import { z } from 'zod';
import { getApiClient } from '@kiosk-zsp4/shared/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosMutationConfig } from '@kiosk-zsp4/shared/types/query';
import { setAuthToken } from '@kiosk-zsp4/shared/features/auth/utils/token';
import { getAuthenticatedUserQueryOptions } from '@kiosk-zsp4/shared/features/users/api/get-authenticated-user';

export const logInInputSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LogInInput = z.infer<typeof logInInputSchema>;

export function logIn({
  data,
}: {
  data: LogInInput;
}): Promise<{ token: string }> {
  return getApiClient().post('/auth/login', data);
}

interface UseLogInOptions {
  mutationConfig?: AxiosMutationConfig<typeof logIn>;
}

export function useLogIn({ mutationConfig }: UseLogInOptions = {}) {
  const { onSuccess, ...remainingConfig } = mutationConfig ?? {};

  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (...args) => {
      const [{ token }] = args;
      setAuthToken(token);
      void queryClient.invalidateQueries({
        queryKey: getAuthenticatedUserQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    mutationFn: logIn,
    ...remainingConfig,
  });
}
