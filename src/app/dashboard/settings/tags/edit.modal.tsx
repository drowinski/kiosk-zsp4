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
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Input, InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { Button } from '@/components/base/button';
import { tagRepository } from '@/features/tags/tags.repository';
import { updateTagSchema } from '@/features/tags/tags.validation';
import { tryAsync } from '@/utils/try';

const tagEditFormSchema = updateTagSchema;

export async function loader({ params }: LoaderFunctionArgs) {
  const tagId = parseInt(params.id || '');
  if (!tagId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const tag = await tagRepository.getTagById(tagId);
  if (!tag) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  return { tag };
}

export async function action({ request, context: { logger } }: ActionFunctionArgs) {
  logger.info('Parsing form data...');
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: tagEditFormSchema, async: true });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  logger.info('Updating tag...');
  const [tag, tagOk, tagError] = await tryAsync(tagRepository.updateTag(submission.value));
  if (!tagOk) {
    logger.error(tagError);
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }
  if (!tag) {
    logger.warn('No tag returned.');
    return { lastResult: submission.reply({ formErrors: ['Błąd przy aktualizacji danych'] }) };
  }

  logger.info('Success.');
  return redirect('..');
}

export default function TagEditModal() {
  const { tag } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult ?? null,
    onValidate: ({ formData }) => {
      const res = parseWithZod(formData, { schema: tagEditFormSchema });
      console.log(res);
      return res;
    },
    defaultValue: {
      id: tag.id,
      name: tag.name
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
            <span>
              Zmień nazwę tagu
              <br />
              <span className={'font-bold'}>{tag.name}</span>
            </span>
          </ModalTitle>
          <ModalDescription className={'sr-only'}>Edytuj tag</ModalDescription>
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
            <span className={'sr-only'}>Nazwa</span>
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
