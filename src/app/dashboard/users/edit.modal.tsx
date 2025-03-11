import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/base/modal';
import { Form, useActionData, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { updateUserSchema } from '@/features/users/users.validation';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { userRepository } from '@/features/users/users.repository';
import { Input, InputDescription, InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { Button } from '@/components/base/button';
import { requireSuperuser } from '@/features/users/users.server-utils';
import { getSession } from '@/features/sessions/sessions.server-utils';
import { userService } from '@/features/users/users.service';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Checkbox } from '@/components/base/checkbox';

const userEditFormSchema = updateUserSchema
  .extend({ repeatPassword: updateUserSchema.shape.password })
  .refine(({ password, repeatPassword }) => password === repeatPassword, {
    path: ['repeatPassword'],
    message: 'Hasła muszą być takie same'
  });

const userDeleteRequestSchema = updateUserSchema.pick({ id: true });

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);

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

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);

  if (request.method === 'POST') {
    const formData = await request.formData();
    const submission = await parseWithZod(formData, { schema: userEditFormSchema, async: true });
    if (submission.status !== 'success') {
      return { lastResult: submission.reply() };
    }
    const result = await userService.updateUser(submission.value);
    if (!result) {
      return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
    }
    return { lastResult: submission.reply({ resetForm: true }) };
  } else if (request.method === 'DELETE') {
    // TODO: delete
  }
}

export default function UserEditModal() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
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
      isSuperuser: user.isSuperuser
    }
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
            Edycja użytkownika
            <br />
            &#34;{user.username}&#34;
          </ModalTitle>
          <DialogDescription className={'sr-only'}>Edytuj użytkownika</DialogDescription>
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
              defaultChecked={user.isSuperuser}
              aria-invalid={fields.isSuperuser.errors ? true : undefined}
              aria-errormessage={fields.isSuperuser.errors ? fields.isSuperuser.errorId : undefined}
              aria-describedby={fields.isSuperuser.descriptionId}
            />
          </Label>
          <InputDescription id={fields.isSuperuser.descriptionId}>Superużytkownicy mogą zarządzać innymi użytkownikami</InputDescription>
          <InputErrorMessage id={fields.isSuperuser.errorId}>{fields.isSuperuser.errors}</InputErrorMessage>
          <Button
            type={'submit'}
            className={'bg-green-600 text-white'}
            disabled={!form.dirty}
          >
            Zapisz zmiany
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
