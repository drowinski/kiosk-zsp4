import { Card } from '@kiosk-zsp4/shared/components/card';
import { Input } from '@kiosk-zsp4/shared/components/input';
import { Form } from '@kiosk-zsp4/shared/components/form';
import { FormGroup } from '@kiosk-zsp4/shared/components/form-group';
import { Button } from '@kiosk-zsp4/shared/components/button';
import { CardHeader } from '@kiosk-zsp4/shared/components/card-header';
import { useLogIn } from '@kiosk-zsp4/shared/features/auth/api/log-in';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { FormError } from '@kiosk-zsp4/shared/components/form-error';

export function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const { mutate: logIn } = useLogIn({
    mutationConfig: {
      onError: (error) => {
        console.error('Login error:', error.request);
        setErrorMessage(
          error.status === 401 ? 'Nieprawidłowe dane' : 'Wystąpił błąd serwera',
        );
        setForm((prev) => ({ ...prev, password: '' }));
      },
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    logIn({ data: form });
  };

  return (
    <div className="flex h-full items-center justify-center">
      <Card>
        <CardHeader>
          <h1 className="font-heading-md">Zaloguj się</h1>
        </CardHeader>
        <Form onSubmit={handleSubmit}>
          <FormError>{errorMessage}</FormError>
          <FormGroup>
            <Input
              name="username"
              placeholder="Nazwa użytkownika"
              value={form.username}
              onChange={handleInputChange}
            />
            <Input
              name="password"
              type="password"
              placeholder="Hasło"
              value={form.password}
              onChange={handleInputChange}
            />
          </FormGroup>
          <Button>Zaloguj się</Button>
        </Form>
      </Card>
    </div>
  );
}
