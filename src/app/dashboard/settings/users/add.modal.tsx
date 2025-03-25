import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/base/modal';
import {
  Form,
  useActionData,
  useLocation,
  useNavigate,
  useNavigation,
  ActionFunctionArgs,
  LoaderFunctionArgs
} from 'react-router';
import { createUserSchema } from '@/features/users/users.validation';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Input, InputDescription, InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { Button } from '@/components/base/button';
import { requireSuperuser } from '@/features/users/users.server-utils';
import { getSession } from '@/features/sessions/sessions.server-utils';
import { userService } from '@/features/users/users.service';
import { Checkbox } from '@/components/base/checkbox';

const userCreateFormSchema = createUserSchema
  .extend({ repeatPassword: createUserSchema.shape.password })
  .refine(({ password, repeatPassword }) => password === repeatPassword, {
    path: ['repeatPassword'],
    message: 'Hasła muszą być takie same.'
  });

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  await requireSuperuser(session.data.userId);
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: userCreateFormSchema, async: true });
  console.log(submission);
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  const result = await userService.registerUser(
    submission.value.username,
    submission.value.password,
    submission.value.isSuperuser
  );
  if (!result) {
    return { lastResult: submission.reply({ formErrors: ['Wystąpił błąd.'] }) };
  }
  return { lastResult: submission.reply({ resetForm: true }) };
}

export default function UserCreateModal() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult ?? null,
    onValidate: ({ formData }) => {
      const res = parseWithZod(formData, { schema: userCreateFormSchema });
      console.log(res);
      return res;
    },
    defaultValue: {
      username: '',
      password: '',
      repeatPassword: '',
      isSuperuser: ''
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
          <ModalTitle>Dodawanie użytkownika</ModalTitle>
          <ModalDescription className={'sr-only'}>Dodaj użytkownika</ModalDescription>
        </ModalHeader>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex grow flex-col gap-2'}
          navigate={true}
        >
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
            Hasło
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
            Powtórz hasło
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
              defaultChecked={false}
              defaultValue={fields.isSuperuser.initialValue}
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
            disabled={
              !(fields.username.dirty && fields.password.dirty && fields.repeatPassword.dirty) ||
              navigation.state !== 'idle'
            }
          >
            Dodaj
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
