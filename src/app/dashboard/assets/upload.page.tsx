import { ActionFunctionArgs, useActionData } from 'react-router';
import { AssetUploadForm } from '@/app/dashboard/assets/_components/asset-upload-form/asset-upload-form';
import { assetUploadFormAction } from '@/app/dashboard/assets/_components/asset-upload-form/asset-upload-form-action';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return assetUploadFormAction(formData, '/dashboard/assets');
}

export default function AssetUploadPage() {
  const actionData = useActionData<typeof action>();

  return (
    <main className={'flex h-full overflow-y-auto'}>
      <AssetUploadForm
        lastSubmissionResult={actionData?.submissionResult}
        className={'w-full'}
      />
    </main>
  );
}
