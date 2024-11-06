import { z } from '@/lib/zod';
import { assetSchema } from '@/features/assets/assets.validation';
import { FormProvider, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Form } from '@remix-run/react';
import { cn } from '@/utils/styles';
import { Input } from '@/components/base/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/base/button';
import { Asset } from '@/features/assets/components/asset';
import { Card } from '@/components/base/card';

export const assetFormSchema = z.object({
  assets: z.array(
    z.object({
      file: z.instanceof(File, { message: 'Dodaj plik. ' }),
      description: assetSchema.shape.description
    })
  )
});

export async function assetUploadFormAction(formData: FormData) {
  const submission = parseWithZod(formData, { schema: assetFormSchema });
  if (submission.status !== 'success') {
    return { submissionResult: submission.reply() };
  }

  // const asset = await assetService.uploadAsset(ReadStream.fromWeb(file.stream() as NodeReadableStream) as ReadStream, {
  //   mimeType: file.type,
  //   description: submission.value.description
  // });

  console.log('files:', submission.value.assets);
  console.log('data:', submission.value.assets);

  return { submissionResult: submission.reply() };
}

// export function AssetUploadFormFilePicker() {
//   const [field, form] = useField<z.infer<typeof assetFormSchema.shape.files>, z.infer<typeof assetFormSchema>>('files');
//
//   return (
//     <>
//       <Input
//         type={'file'}
//         name={field.name}
//         accept={'image/jpeg, image/png, video/mp4'}
//         multiple
//       />
//       <div>{field.errors}</div>
//     </>
//   );
// }

interface AssetUploadFormProps {
  lastSubmissionResult?: SubmissionResult;
  className?: string;
}

export function AssetUploadForm({ lastSubmissionResult, className }: AssetUploadFormProps) {
  const [form, fields] = useForm({
    lastResult: lastSubmissionResult,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: assetFormSchema });
      console.log(result);
      return result;
    }
  });
  const assetFields = fields.assets.getFieldList();
  const { files, objectURLs, setFiles } = useFilesWithObjectURLs();

  const createAssetFields = (fileList: File[] | FileList) => {
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
    for (let i = 0; i < fileList.length; i++) {
      form.insert({
        name: fields.assets.name
      });
    }
  };

  const removeAssetField = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    form.remove({
      name: fields.assets.name,
      index: index
    });
  };

  return (
    <>
      <Button asChild>
        <label>
          <input
            type={'file'}
            accept={'image/jpeg, image/png, video/mp4'}
            onInput={(event) => {
              const fileList = event.currentTarget.files;
              if (!fileList) return;
              createAssetFields(fileList);
              event.currentTarget.value = '';
            }}
            multiple
            className={'hidden'}
          />
          Dodaj pliki
        </label>
      </Button>
      <FormProvider context={form.context}>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          encType="multipart/form-data"
          className={cn('flex flex-col gap-3', className)}
        >
          <div className={'grid grid-cols-3 gap-2'}>
            {assetFields.map((field, index) => {
              const fieldset = field.getFieldset();

              const file = files[index];
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(files[index]);

              return (
                <Card
                  key={field.key}
                  className={'flex flex-col gap-2 overflow-hidden rounded-xl'}
                >
                  <Button
                    type={'button'}
                    size={'icon'}
                    variant={'ghost'}
                    onClick={() => removeAssetField(index)}
                  >
                    ❌
                  </Button>
                  {objectURLs.at(index) && (
                    <Asset
                      fullUrl={objectURLs.at(index)}
                      fileName={file.name}
                      assetType={file.type.split('/')[0] as never}
                      className={'max-h-48 object-contain'}
                    />
                  )}
                  <Input
                    ref={(ref) => ref && (ref.files = dataTransfer.files)}
                    type={'file'}
                    accept={'image/jpeg, image/png, video/mp4'}
                    // name={fieldset.file.name}
                    onChange={(event) => {
                      const fileList = event.currentTarget.files;
                      if (!fileList) return;
                      // setFiles((prev) => [...prev.splice(0, index - 1), fileList.item(0)!, ...prev.splice(index + 1)]);
                    }}
                  />
                  <Input
                    type={'text'}
                    name={fieldset.description.name}
                    placeholder={'Opis'}
                  />
                </Card>
              );
            })}
          </div>
          <Button type={'submit'}>Prześlij</Button>
        </Form>
      </FormProvider>
    </>
  );
}

export function useFilesWithObjectURLs() {
  const [files, setFiles] = useState<File[]>([]);
  const [objectURLs, setObjectURLs] = useState<string[]>([]);

  useEffect(() => {
    const _objectURLs = files?.map((file) => URL.createObjectURL(file)) ?? [];
    setObjectURLs(_objectURLs);
    return () => {
      _objectURLs.forEach((objectURL) => URL.revokeObjectURL(objectURL));
    };
  }, [files]);
  //
  // const setFiles: typeof _setFiles = (value) => {
  //   objectURLs.forEach((objectURL) => URL.revokeObjectURL(objectURL));
  //   _setFiles(value);
  //   const _objectURLs = files?.map((file) => URL.createObjectURL(file)) ?? [];
  //   setObjectURLs(_objectURLs);
  // }

  return { files, objectURLs, setFiles };
}
