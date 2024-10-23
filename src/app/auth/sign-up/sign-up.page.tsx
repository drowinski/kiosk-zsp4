import { Form, useActionData } from '@remix-run/react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { userPasswordSchema, userSchema } from '@/features/users/users.validation';
import { userService } from '@/features/users/users.service';
import { getSession } from '@/features/sessions/sessions.utils';
import { sessionStorage } from '@/features/sessions/sessions.storage';

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
    shouldRevalidate: 'onInput'
  });

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <div className={'flex flex-col gap-2 bg-black p-4'}>
        <span className={'text-white'}>SIGN UP</span>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex flex-col gap-2'}
        >
          {form.errors && <div className={'text-red-500'}>{form.errors}</div>}
          <input
            type={'text'}
            key={fields.email.key}
            name={fields.email.name}
            defaultValue={fields.email.initialValue}
          />
          <div className={'text-red-500'}>{fields.email.errors}</div>
          <input
            type={'password'}
            key={fields.password.key}
            name={fields.password.name}
            defaultValue={fields.password.initialValue}
          />
          <div className={'text-red-500'}>{fields.password.errors}</div>
          <button
            type="submit"
            className={'bg-white text-black'}
          >
            Submit
          </button>
        </Form>
      </div>
    </main>
  );
}
