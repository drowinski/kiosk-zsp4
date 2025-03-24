import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/base/modal';
import { Form, useActionData, useLocation, useNavigate, useNavigation } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs } from '@remix-run/node';
import { Input, InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { Button } from '@/components/base/button';
import { tagRepository } from '@/features/tags/tags.repository';
import { createTagSchema } from '@/features/tags/tags.validation';

const tagCreateFormSchema = createTagSchema;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: tagCreateFormSchema, async: true });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  const result = await tagRepository.createTag(submission.value);
  if (!result) {
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }
  return { lastResult: submission.reply({ resetForm: true }) };
}

export default function TagCreateModal() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult ?? null,
    onValidate: ({ formData }) => {
      const res = parseWithZod(formData, { schema: tagCreateFormSchema });
      console.log(res);
      return res;
    },
    defaultValue: {
      name: ''
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
          <ModalTitle>Utwórz tag</ModalTitle>
          <ModalDescription className={'sr-only'}>Utwórz nowy tag</ModalDescription>
        </ModalHeader>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className={'flex grow flex-col gap-2'}
        >
          <Label className={'w-full'}>
            Nazwa
            <Input
              type={'text'}
              name={fields.name.name}
              defaultValue={fields.name.initialValue}
              className={'w-full'}
              aria-invalid={fields.name.errors ? true : undefined}
              aria-errormessage={fields.name.errors ? fields.name.errorId : undefined}
            />
          </Label>
          <InputErrorMessage id={fields.name.errorId}>{fields.name.errors}</InputErrorMessage>
          <Button
            type={'submit'}
            variant={'success'}
            disabled={navigation.state !== 'idle' || !form.dirty}
          >
            Zapisz
          </Button>
        </Form>
      </ModalContent>
    </Modal>
  );
}
