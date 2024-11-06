import { ActionFunctionArgs } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { AssetUploadForm, assetUploadFormAction } from '@/features/assets/components/asset-upload-form';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return assetUploadFormAction(formData);
}

export default function AssetUploadPage() {
  const actionData = useActionData<typeof action>();

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <div className={'flex max-h-full max-w-full flex-col gap-2 p-4'}>
        <AssetUploadForm lastSubmissionResult={actionData?.submissionResult} />
      </div>
    </main>
  );
}
