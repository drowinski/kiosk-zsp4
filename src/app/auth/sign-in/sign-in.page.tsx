import { Form, useActionData } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod';
import { userPasswordSchema, userSchema } from '@/features/users/users.validation';
import { parseWithZod } from '@conform-to/zod';
import { userService } from '@/features/users/users.service';

const formSchema = z.object({
  email: userSchema.shape.email,
  password: userPasswordSchema
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: formSchema });
  if (submission.status !== 'success') {
    return json({ lastResult: submission.reply(), user: null });
  }

  const user = await userService.signIn(submission.value.email, submission.value.password);
  if (!user) {
    return json({ lastResult: submission.reply({ formErrors: ['Błąd.'] }), user: null });
  }

  return json({ lastResult: submission.reply(), user: user });
}

export default function SignInPage() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: actionData?.lastResult ?? null,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: formSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput'
  });

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <div className={'flex flex-col gap-2 bg-black p-4'}>
        <span className={'text-white'}>SIGN IN</span>
        {actionData?.user && <span className={'text-white'}>User id: {actionData.user.id}</span>}
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
