import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { assetRepository } from '@/features/assets/assets.repository';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { assetCreateSchema } from '@/features/assets/assets.validation';
import { parseWithZod } from '@conform-to/zod';
import { Input } from '@/components/base/input';
import { Asset } from '@/features/assets/components/asset';
import { Button } from '@/components/base/button';
import { CheckIcon, PencilIcon } from '@/components/icons';
import { ClientOnly } from 'remix-utils/client-only';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/base/modal';

const assetEditFormSchema = assetCreateSchema.pick({
  description: true
});

export async function loader({ params }: LoaderFunctionArgs) {
  const assetId = parseInt(params.id || '');
  if (!assetId) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  const asset = await assetRepository.getAssetById(assetId);
  if (!asset) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  return { asset };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('test');
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: assetEditFormSchema });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  console.log(submission.value.description);
  return { lastResult: submission.reply() };
}

export default function AssetEditModal() {
  const { asset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: assetEditFormSchema });
      console.log(result);
      return result;
    },
    defaultValue: {
      ...asset
    }
  });

  return (
    <ClientOnly>
      {() => (
        <Modal
          onOpenChange={(open) => !open && navigate('..')}
          defaultOpen
        >
          <ModalContent>
            <ModalHeader>
              <ModalTitle className={'flex gap-2'}><PencilIcon/> Edycja zawartości</ModalTitle>
            </ModalHeader>
            <Form
              method={'post'}
              id={form.id}
              onSubmit={form.onSubmit}
              noValidate
              className={'flex grow flex-col gap-2'}
            >
              <div className={'flex max-h-60 max-w-full items-start justify-center'}>
                <Asset
                  assetType={asset.assetType}
                  fileName={asset.fileName}
                />

              </div>
              <Input
                type={'text'}
                key={fields.description.key}
                name={fields.description.name}
                defaultValue={fields.description.initialValue}
                placeholder={'Opis'}
                errorMessages={fields.description.errors}
              />
              <Button
                type={'submit'}
                className={'flex gap-2 bg-green-600'}
              >
                <CheckIcon /> Zatwierdź zmiany
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </ClientOnly>
  );
}
