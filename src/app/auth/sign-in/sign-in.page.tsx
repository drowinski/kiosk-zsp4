import { Form, useActionData } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { z } from '@/lib/zod';
import { userPasswordSchema, userSchema } from '@/features/users/users.validation';
import { parseWithZod } from '@conform-to/zod';
import { userService } from '@/features/users/users.service';
import { sessionStorage } from '@/features/sessions/sessions.storage';
import { getSession } from '@/features/sessions/sessions.utils';
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
    return json({ lastResult: submission.reply() });
  }

  const user = await userService.validateUser(submission.value.email, submission.value.password);
  if (!user) {
    return json({ lastResult: submission.reply({ formErrors: ['Błąd.'] }) });
  }

  const session = await sessionStorage.getSession();
  session.set('userId', user.id);

  return json(
    { lastResult: submission.reply() },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session)
      }
    }
  );
}

export default function SignInPage() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: actionData?.lastResult ?? null,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: formSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur'
  });

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <Card className={'flex flex-col gap-3'}>
        <span className={'text-primary text-xl uppercase'}>Logowanie</span>
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
          />
          <Input
            type={'password'}
            key={fields.password.key}
            name={fields.password.name}
            defaultValue={fields.password.initialValue}
            placeholder={'Hasło'}
            errorMessages={fields.email.errors}
          />
          <Button variant={'default'} type={'submit'}>Zaloguj się</Button>
        </Form>
      </Card>
    </main>
  );
}
