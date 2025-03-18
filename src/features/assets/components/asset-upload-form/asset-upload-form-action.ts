import { parseWithZod } from '@conform-to/zod';
import { assetService } from '@/features/assets/assets.service';
import { ReadStream } from 'node:fs';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { assetFormSchema } from '@/features/assets/components/asset-upload-form/asset-upload-form';
import { redirect } from '@remix-run/node';

export async function assetUploadFormAction(formData: FormData, redirectUrl?: string) {
  console.log(formData);
  const submission = parseWithZod(formData, { schema: assetFormSchema });
  if (submission.status !== 'success') {
    return { submissionResult: submission.reply() };
  }

  const assets = submission.value.assets;

  if (assets.length === 0) {
    return { submissionResult: submission.reply() };
  }

  for (const asset of assets) {
    const file = asset.file;
    await assetService.uploadAsset(
      ReadStream.fromWeb(file.stream() as NodeReadableStream) as ReadStream,
      {
        mimeType: file.type,
        description: asset.description,
        date: asset.date
      }
    );
  }

  return redirectUrl ? redirect(redirectUrl) : { submissionResult: submission.reply() };
}
