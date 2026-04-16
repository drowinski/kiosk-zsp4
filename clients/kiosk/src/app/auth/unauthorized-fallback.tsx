import { useLogIn } from '@kiosk-zsp4/shared/features/auth/api/log-in';
import { useEffect } from 'react';
import { env } from '@/config/env';

export function UnauthorizedFallback() {
  const { mutate: logIn, isPending, isSuccess, isError } = useLogIn();

  useEffect(() => {
    logIn({ data: { username: env.USERNAME, password: env.PASSWORD } });
  }, [logIn]);

  return (
    <div>
      Kiosk niezalogowany.
      {isPending && 'Próba autoryzacji... '}
      {isError && 'Autoryzacja nie powiodła się. '}
      {isSuccess && 'Autoryzacja powiodła się.'}
    </div>
  );
}
