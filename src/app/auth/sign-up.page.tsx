import { Form, useActionData } from '@remix-run/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from '@/lib/zod';
import { userPasswordSchema, userSchema } from '@/features/users/users.validation';
import { userService } from '@/features/users/users.service';
import { getSession } from '@/features/sessions/sessions.utils';
import { sessionStorage } from '@/features/sessions/sessions.storage';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';

const formSchema = z.object({
  email: userSchema.shape.email,
  password: userPasswordSchema
});

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session || !session.id) {
    return new Response(null, { headers: { 'Set-Cookie': await sessionStorage.destroySession(session) } });
  }
  return redirect('/');
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: formSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await userService.registerUser(submission.value.email, submission.value.password);
  } catch (error) {
    return json(submission.reply({ formErrors: ['Błąd.'] }));
  }

  return redirect('/auth/sign-in');
}

export default function SignUpPage() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: lastResult,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: formSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur'
  });

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <Card className={'flex flex-col gap-3'}>
        <span className={'text-primary text-xl'}>REJESTRACJA</span>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex flex-col gap-2'}
        >
          {form.errors && <span className={'text-red-500'}>{form.errors}</span>}
          <Input
            type={'text'}
            key={fields.email.key}
            name={fields.email.name}
            defaultValue={fields.email.initialValue}
            placeholder={'Email'}
            errorMessages={fields.email.errors}
            autoComplete={'email'}
          />
          <Input
            type={'password'}
            key={fields.password.key}
            name={fields.password.name}
            defaultValue={fields.password.initialValue}
            placeholder={'Hasło'}
            errorMessages={fields.password.errors}
            autoComplete={'password'}
          />
          <Button
            type={'submit'}
          >
            Zarejestruj się
          </Button>
        </Form>
      </Card>
    </main>
  );
}
