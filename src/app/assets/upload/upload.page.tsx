import { ActionFunctionArgs, json, LoaderFunctionArgs, TypedResponse } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from '@/lib/zod';
import { assetService } from '@/features/assets/assets.service';
import { requireSession } from '@/features/sessions/sessions.utils';
import { ReadStream } from 'node:fs';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { Asset } from '@/features/assets/assets.validation';

const formSchema = z.object({
  file: z.instanceof(File, { message: 'Dodaj plik.' })
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireSession(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs): Promise<
  TypedResponse<{
    submissionResult: SubmissionResult;
    asset?: Asset;
  }>
> {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: formSchema });
  if (submission.status !== 'success') {
    return json({ submissionResult: submission.reply() });
  }

  const file = submission.value.file;

  const asset = await assetService.uploadAsset(
    ReadStream.fromWeb(file.stream() as NodeReadableStream) as ReadStream,
    file.name,
    file.type
  );

  console.log(asset);

  return json({ submissionResult: submission.reply(), asset: asset });
}

export default function AssetUploadPage() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: actionData?.submissionResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: formSchema })
  });

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <div className={'flex flex-col gap-2 bg-black p-4 text-white'}>
        {actionData?.asset && (
          <div className={'flex flex-col gap-2'}>
            {Object.entries(actionData.asset).map(([key, value]) => (
              <span key={key}>{key}: {value}</span>
            ))}
          </div>
        )}
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          encType="multipart/form-data"
          className={'flex flex-col gap-2'}
        >
          <input
            type={'file'}
            name={fields.file.name}
            accept={'image/jpeg, image/png, video/mp4'}
          />
          <div>{fields.file.errors}</div>
          <button
            type={'submit'}
            className={'bg-white p-2 text-black'}
          >
            Wgraj
          </button>
        </Form>
      </div>
    </main>
  );
}
