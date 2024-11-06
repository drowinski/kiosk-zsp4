import { ActionFunctionArgs } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { AssetUploadForm } from '@/features/assets/components/asset-upload-form/asset-upload-form';
import { assetUploadFormAction } from '@/features/assets/components/asset-upload-form/asset-upload-form-action';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return assetUploadFormAction(formData);
}

export default function AssetUploadPage() {
  const actionData = useActionData<typeof action>();

  return (
    <main className={'flex h-full flex-col items-center justify-center'}>
      <div className={'max-h-full max-w-full h-full flex-col gap-2 p-4 overflow-auto'}>
        <AssetUploadForm lastSubmissionResult={actionData?.submissionResult} />
      </div>
    </main>
  );
}
