import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/base/modal';
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect
} from 'react-router';
import { updateUserSchema } from '@/features/users/users.schemas';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { userRepository } from '@/features/users/.server/users.repository';
import { Input, InputDescription, InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { Button } from '@/components/base/button';
import { userService } from '@/features/users/.server/users.service';
import { Checkbox } from '@/components/base/checkbox';
import { status, StatusCodes } from '@/utils/status-response';
import { tryAsync } from '@/utils/try';

const userEditFormSchema = updateUserSchema
  .extend({ repeatPassword: updateUserSchema.shape.password })
  .refine(({ password, repeatPassword }) => password === repeatPassword, {
    path: ['repeatPassword'],
    message: 'Hasła muszą być takie same.'
  });

export async function loader({ params, context: { session } }: LoaderFunctionArgs) {
  if (!session || !session.user.isSuperuser) {
    throw status(StatusCodes.FORBIDDEN);
  }

  const userId = parseInt(params.id || '');
  if (!userId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  return { user };
}

export async function action({ request, context: { logger, session } }: ActionFunctionArgs) {
  logger.info('Checking if superuser...');
  if (!session || !session.user.isSuperuser) {
    logger.warn('Not superuser. Forbidden.');
    throw status(StatusCodes.FORBIDDEN);
  }

  logger.info('Parsing form data...');
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: userEditFormSchema, async: true });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  logger.info('Updating user...');
  const [user, userOk, userError] = await tryAsync(userService.updateUser(submission.value));
  if (!userOk) {
    logger.error(userError);
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }
  if (!user) {
    logger.warn('No user returned.');
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }

  logger.info('Success.');
  return redirect('..');
}

export default function UserEditModal() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult ?? null,
    onValidate: ({ formData }) => {
      const res = parseWithZod(formData, { schema: userEditFormSchema });
      console.log(res);
      return res;
    },
    defaultValue: {
      id: user.id,
      username: user.username,
      password: '',
      repeatPassword: '',
      isSuperuser: user.isSuperuser
    },
    shouldDirtyConsider: (name) => name !== 'isSuperuser'
  });

  return (
    <Modal
      onOpenChange={(open) =>
        !open && navigate(location.state?.previousPathname + location.state?.previousSearch || '..')
      }
      defaultOpen
    >
      <ModalContent className={'w-fit max-w-72'}>
        <ModalHeader>
          <ModalTitle>
            <span>
              Edycja użytkownika
              <br />
              <span className={'font-bold'}>{user.username}</span>
            </span>
          </ModalTitle>
          <ModalDescription className={'sr-only'}>Edytuj użytkownika</ModalDescription>
        </ModalHeader>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex grow flex-col gap-2'}
        >
          <input
            type="hidden"
            name={fields.id.name}
            defaultValue={fields.id.initialValue}
            readOnly
          />
          <Label className={'w-full'}>
            Nazwa użytkownika
            <Input
              type={'text'}
              name={fields.username.name}
              defaultValue={fields.username.initialValue}
              className={'w-full'}
              aria-invalid={fields.username.errors ? true : undefined}
              aria-errormessage={fields.username.errors ? fields.username.errorId : undefined}
            />
          </Label>
          <InputErrorMessage id={fields.username.errorId}>{fields.username.errors}</InputErrorMessage>
          <Label className={'w-full'}>
            Nowe hasło
            <Input
              type={'password'}
              name={fields.password.name}
              className={'w-full'}
              aria-invalid={fields.password.errors ? true : undefined}
              aria-errormessage={fields.password.errors ? fields.password.errorId : undefined}
            />
          </Label>
          <InputErrorMessage id={fields.password.errorId}>{fields.password.errors}</InputErrorMessage>
          <Label className={'w-full'}>
            Powtórz nowe hasło
            <Input
              type={'password'}
              name={fields.repeatPassword.name}
              defaultValue={fields.repeatPassword.initialValue}
              className={'w-full'}
              aria-invalid={fields.repeatPassword.errors ? true : undefined}
              aria-errormessage={fields.repeatPassword.errors ? fields.repeatPassword.errorId : undefined}
            />
          </Label>
          <InputErrorMessage id={fields.repeatPassword.errorId}>{fields.repeatPassword.errors}</InputErrorMessage>
          <Label variant={'horizontal'}>
            Superużytkownik?
            <Checkbox
              name={fields.isSuperuser.name}
              id={fields.isSuperuser.id}
              defaultChecked={fields.isSuperuser.initialValue === 'on'}
              aria-invalid={fields.isSuperuser.errors ? true : undefined}
              aria-errormessage={fields.isSuperuser.errors ? fields.isSuperuser.errorId : undefined}
              aria-describedby={fields.isSuperuser.descriptionId}
            />
          </Label>
          <InputDescription id={fields.isSuperuser.descriptionId}>
            Superużytkownicy mogą zarządzać innymi użytkownikami
          </InputDescription>
          <InputErrorMessage id={fields.isSuperuser.errorId}>{fields.isSuperuser.errors}</InputErrorMessage>
          <Button
            type={'submit'}
            variant={'success'}
            disabled={navigation.state !== 'idle'}
          >
            Zapisz zmiany
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
