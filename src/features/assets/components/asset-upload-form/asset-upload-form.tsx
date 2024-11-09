import { z } from '@/lib/zod';
import { assetCreateSchema } from '@/features/assets/assets.validation';
import { SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Form } from '@remix-run/react';
import { cn } from '@/utils/styles';
import { Input, InputMessage } from '@/components/base/input';
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/base/button';
import { Asset } from '@/features/assets/components/asset';
import { Card } from '@/components/base/card';

export const assetFormSchema = z.object({
  assets: z
    .array(
      z.object({
        file: z.instanceof(File, { message: 'Dodaj plik. ' }),
        description: assetCreateSchema.shape.description
      })
    )
    .min(1, { message: 'Dodaj pliki. ' })
});

interface AssetUploadFormProps {
  lastSubmissionResult?: SubmissionResult;
  className?: string;
}

export function AssetUploadForm({ lastSubmissionResult, className }: AssetUploadFormProps) {
  const [form, fields] = useForm({
    lastResult: lastSubmissionResult,
    onValidate: ({ formData }) => {
      console.log(formData);
      const result = parseWithZod(formData, { schema: assetFormSchema });
      console.log(result);
      return result;
    }
  });
  const assetFields = fields.assets.getFieldList();
  const { files, objectURLs, setFiles } = useFilesWithObjectURLs();

  const createAssetFields = (fileList: File[] | FileList) => {
    fileList = Array.from(fileList);
    setFiles((prev) => [...prev, ...fileList]);
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
    <Form
      method={'post'}
      id={form.id}
      onSubmit={form.onSubmit}
      encType="multipart/form-data"
      className={cn('flex flex-col gap-3', className)}
    >
      <div className={'sticky left-0 right-0 top-0'}>
        <Card className={'flex gap-2'}>
          <Button
            asChild
          >
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
              {assetFields.length === 0 ? 'Dodaj pliki...' : 'Dodaj więcej plików...'}
            </label>
          </Button>
          <Button
            type={'submit'}
            disabled={assetFields.length === 0}
            className={'ml-auto'}
          >
            Prześlij
          </Button>
        </Card>
      </div>
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
              {objectURLs.at(index) && (
                <div className={'flex h-48 items-center justify-center'}>
                  <Asset
                    fullUrl={objectURLs.at(index)}
                    fileName={file.name}
                    assetType={file.type.split('/')[0] as never}
                  />
                </div>
              )}
              <div className={'flex gap-1'}>
                <div className={'flex h-full min-w-0 grow items-center px-2'}>
                  <div className={'overflow-hidden text-ellipsis whitespace-nowrap'}>{file.name}</div>
                </div>
                <Button asChild>
                  <label>
                    <input
                      ref={(ref) => ref && (ref.files = dataTransfer.files)}
                      type={'file'}
                      accept={'image/jpeg, image/png, video/mp4'}
                      name={fieldset.file.name}
                      onChange={(event) => {
                        const fileList = event.currentTarget.files;
                        if (!fileList || fileList.length === 0) return;
                        setFiles((prev) => {
                          const newFiles = Array.from(prev);
                          newFiles[index] = fileList.item(0)!;
                          return newFiles;
                        });
                      }}
                      className={'hidden'}
                    />
                    Zmień plik...
                  </label>
                </Button>
                {fieldset.file.errors && <InputMessage>{fieldset.file.errors}</InputMessage>}
                <Button
                  type={'button'}
                  onClick={() => removeAssetField(index)}
                >
                  Usuń
                </Button>
              </div>
              <Input
                type={'text'}
                name={fieldset.description.name}
                placeholder={'Opis'}
                defaultValue={file.name.replace(/\.[a-zA-Z0-9]+$/, '')}
              />
              {fieldset.description.errors && <InputMessage>{fieldset.description.errors}</InputMessage>}
            </Card>
          );
        })}
      </div>
      {fields.assets.errors && <InputMessage>{fields.assets.errors}</InputMessage>}
    </Form>
  );
}

export function useFilesWithObjectURLs() {
  const [files, _setFiles] = useState<File[]>([]);
  const [objectURLs, setObjectURLs] = useState<string[]>([]);

  // TODO: Delete if new method not buggy
  // useEffect(() => {
  //   const _objectURLs = files?.map((file) => URL.createObjectURL(file)) ?? [];
  //   setObjectURLs(_objectURLs);
  //   return () => {
  //     _objectURLs.forEach((objectURL) => URL.revokeObjectURL(objectURL));
  //   };
  // }, [files]);

  const setFiles: React.Dispatch<React.SetStateAction<File[]>> = useCallback((value) => {
    _setFiles((prev) => {
      const newFiles = typeof value === 'function' ? value(prev) : value;
      objectURLs.forEach((objectURL) => URL.revokeObjectURL(objectURL));
      setObjectURLs(newFiles?.map((file) => URL.createObjectURL(file)) ?? []);
      return newFiles;
    });
  }, [objectURLs]);

  return { files, objectURLs, setFiles };
}
