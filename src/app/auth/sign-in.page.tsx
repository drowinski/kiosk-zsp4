import type { Route } from './+types/sign-in.page';
import { data, Form, useNavigation, redirect } from 'react-router';
import { useForm } from '@conform-to/react';
import { z } from '@/lib/zod';
import { userPasswordSchema, userSchema } from '@/features/users/users.schemas';
import { parseWithZod } from '@conform-to/zod';
import { userService } from '@/features/users/.server/users.service';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { sessionService } from '@/features/sessions/.server/sessions.service';
import { getSessionTokenCookie } from '@/features/sessions/.server/sessions.cookies';

const formSchema = z.object({
  username: userSchema.shape.username,
  password: userPasswordSchema
});

export async function loader({ context: { logger, session } }: Route.LoaderArgs) {
  logger.info('Ensuring no existing session...');
  if (session) {
    logger.info('Existing session found, redirecting.');
    return redirect('/dashboard');
  }
  logger.info('Success.');
  return null;
}

export async function action({ request, context: { logger } }: Route.ActionArgs) {
  logger.info('Parsing sign-in form data...');
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: formSchema });
  if (submission.status !== 'success') {
    logger.warn('Validation error on sign-in form.');
    return { lastResult: submission.reply() };
  }

  logger.info(`Validating user ${submission.value.username}...`);
  const user = await userService.validateUser(submission.value.username, submission.value.password);
  if (!user) {
    logger.warn('User validation failed.');
    return { lastResult: submission.reply({ formErrors: ['Błąd.'] }) };
  }

  logger.info(`Preparing session for user "${user.username}"...`);
  const sessionToken = sessionService.generateSessionToken();
  const session = await sessionService.createSession(sessionToken, user.id);
  const sessionCookie = getSessionTokenCookie(sessionToken, session.expiresAt);

  logger.info(`New session created for user "${user.username}", sending cookie...`);
  return data(
    { lastResult: submission.reply() },
    {
      headers: {
        'Set-Cookie': sessionCookie
      }
    }
  );
}

export default function SignInPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: formSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur'
  });

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <Card className={'flex flex-col gap-3'}>
        <span className={'text-xl uppercase text-primary'}>Logowanie</span>
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
            key={fields.username.key}
            name={fields.username.name}
            defaultValue={fields.username.initialValue}
            placeholder={'Nazwa użytkownika'}
            errorMessages={fields.username.errors}
          />
          <Input
            type={'password'}
            key={fields.password.key}
            name={fields.password.name}
            defaultValue={fields.password.initialValue}
            placeholder={'Hasło'}
            errorMessages={fields.password.errors}
          />
          <Button
            variant={'default'}
            type={'submit'}
            disabled={navigation.state !== 'idle'}
          >
            Zaloguj się
          </Button>
        </Form>
      </Card>
    </main>
  );
}
