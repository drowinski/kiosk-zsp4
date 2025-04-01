import type { Route } from './+types/upload.page';
import { parseWithZod } from '@conform-to/zod';
import { assetService } from '@/features/assets/assets.service';
import { ReadStream } from 'node:fs';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { useFetcher } from 'react-router';
import { tryAsync } from '@/utils/try';
import { z } from '@/lib/zod';
import { assetCreateSchema } from '@/features/assets/assets.validation';
import { useForm } from '@conform-to/react';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { CheckIcon, PlusIcon, SpinnerIcon, UploadIcon } from '@/components/icons';
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Asset } from '@/features/assets/components/asset';
import { InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { TextArea } from '@/components/base/text-area';
import { status, StatusCodes } from '@/utils/status-response';
import { useObjectUrl } from '@/hooks/use-object-url';

const assetFormSchema = z
  .object({
    file: z.instanceof(File, { message: 'Dodaj plik. ' })
  })
  .merge(assetCreateSchema.pick({ description: true }));

export async function action({ request, context: { logger } }: Route.ActionArgs) {
  logger.info('Parsing form data...');
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: assetFormSchema, async: true });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), success: false };
  }
  const asset = submission.value;

  logger.info(`Uploading "${asset.file.name}"...`);
  const [, uploadAssetOk, uploadAssetError] = await tryAsync(
    assetService.uploadAsset(ReadStream.fromWeb(asset.file.stream() as NodeReadableStream) as ReadStream, {
      mimeType: asset.file.type,
      description: asset.description
    })
  );
  if (!uploadAssetOk) {
    logger.error(uploadAssetError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info('Success.');
  return { lastResult: submission.reply(), success: true };
}

export default function AssetUploadPage() {
  const formsRef = useRef<Map<string, AssetUploadFormRef> | null>(null);

  const formsMap = () => {
    if (!formsRef.current) {
      formsRef.current = new Map();
    }
    return formsRef.current;
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadAllForms = () => {
    for (const form of formsMap().values()) {
      form.submit(); // Starts upload
    }
  };

  const [files, setFiles] = useState<Map<string, File>>(new Map());
  const fileCount = Array.from(files.keys()).length;

  const addFiles = (files: File[]) => {
    setFiles((prev) => {
      for (const file of files) {
        const key = crypto.randomUUID();
        prev.set(key, file);
      }
      return new Map(prev);
    });
  };

  const deleteFile = (key: string) => {
    setFiles((prev) => {
      prev.delete(key);
      return new Map(prev);
    });
  };

  return (
    <main>
      <div className={'flex w-full flex-col gap-3'}>
        <AssetUploadFormToolbar
          assetCount={fileCount}
          isUploading={isUploading}
          onSubmit={uploadAllForms}
          onAddFiles={addFiles}
        />
        <div className={'grid grid-cols-3 gap-2'}>
          {fileCount > 0 ? (
            Array.from(files.entries()).map(([key, file]) => (
              <AssetUploadForm
                key={key}
                ref={(node) => {
                  const assetUploadForms = formsMap();
                  if (node) {
                    assetUploadForms.set(key, node);
                  } else {
                    assetUploadForms.delete(key);
                  }
                }}
                initialFile={file}
                onDelete={() => deleteFile(key)}
              />
            ))
          ) : (
            <Card className={'col-span-3 flex justify-center font-medium text-muted'}>
              Kliknij &#34;Dodaj pliki...&#34; aby rozpocząć.
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

export interface AssetUploadFormRef {
  submit: () => void;
}

export interface AssetUploadForm {
  initialFile?: File;
  onDelete?: () => void;
}

export const AssetUploadForm = React.forwardRef<AssetUploadFormRef, AssetUploadForm>(
  ({ initialFile, onDelete }, ref) => {
    const formRef = useRef<HTMLFormElement>(null);
    const fetcher = useFetcher<typeof action>();
    const isUploading = fetcher.state !== 'idle';
    const isUploaded = fetcher.data?.success === true;

    const [form, fields] = useForm({
      lastResult: fetcher.data?.lastResult,
      onValidate: ({ formData }) => {
        console.log(formData);
        const result = parseWithZod(formData, { schema: assetFormSchema });
        console.log(result);
        return result;
      }
    });

    const handleSubmit = async () => {
      if (isUploading || isUploaded) return;
      await fetcher.submit(formRef.current, { method: 'post' });
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit
    }));

    const [file, setFile] = useState<File | undefined>(initialFile);
    const fileObjectURL = useObjectUrl(file);

    const fileInputRefCallback = useCallback(
      (ref: HTMLInputElement | null) => {
        if (!ref || !file) return;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        ref.files = dataTransfer.files;
      },
      [file]
    );

    return (
      <Card className={'relative flex flex-col gap-2 overflow-hidden'}>
        <div className={'flex h-48 items-center justify-center'}>
          <Asset
            fullUrl={fileObjectURL}
            assetType={file?.type.startsWith('application') ? 'document' : (file?.type.split('/')[0] as never)}
          />
        </div>
        {!isUploaded ? (
          <fetcher.Form
            ref={formRef}
            method={'post'}
            id={form.id}
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className={'flex w-full flex-col gap-3'}
            aria-disabled={isUploading}
          >
            <div className={'flex items-center gap-1'}>
              {file?.name && (
                <div className={'flex h-full min-w-0 grow items-center px-2'}>
                  <div className={'overflow-hidden text-ellipsis whitespace-nowrap'}>{file.name}</div>
                </div>
              )}
              <Button asChild>
                <label>
                  <input
                    ref={fileInputRefCallback}
                    type={'file'}
                    accept={'image/jpeg, image/png, video/mp4'}
                    name={fields.file.name}
                    onChange={(event) => {
                      const fileList = event.currentTarget.files;
                      if (!fileList) return;
                      const file = fileList.item(0);
                      if (!file) return;
                      setFile(file);
                    }}
                    className={'hidden'}
                  />
                  Zmień plik...
                </label>
              </Button>
              {fields.file.errors && <InputErrorMessage>{fields.file.errors}</InputErrorMessage>}
              <Button
                type={'button'}
                onClick={() => onDelete?.()}
              >
                Usuń
              </Button>
            </div>
            <Label className={'w-full'}>
              Opis
              <TextArea
                key={fields.description.key}
                name={fields.description.name}
                placeholder={'Opis'}
                className={'h-24 resize-none'}
                maxLength={512}
                defaultValue={file?.name.replace(/\.[a-zA-Z0-9]+$/, '')}
              />
            </Label>
            {fields.description.errors && <InputErrorMessage>{fields.description.errors}</InputErrorMessage>}
          </fetcher.Form>
        ) : (
          <div className={'flex h-full w-full items-center justify-center gap-2'}>
            <CheckIcon /> <span>Przesłano</span>
          </div>
        )}
        {isUploading && (
          <div className={'absolute inset-0 flex h-full w-full items-center justify-center bg-black/50'}>
            <Card className={'flex flex-col items-center justify-center gap-2'}>
              <span>Trwa przesyłanie</span>
              <SpinnerIcon className={'animate-spin text-xl'} />
            </Card>
          </div>
        )}
      </Card>
    );
  }
);
AssetUploadForm.displayName = 'AssetUploadForm';

export interface AssetUploadFormToolbarProps {
  assetCount: number;
  isUploading?: boolean;
  onAddFiles: (files: File[]) => void;
  onSubmit: () => void;
}

export function AssetUploadFormToolbar({
  assetCount,
  isUploading = false,
  onAddFiles,
  onSubmit
}: AssetUploadFormToolbarProps) {
  return (
    <div className={'sticky left-0 right-0 top-0'}>
      <Card className={'flex gap-2'}>
        <Button
          className={'cursor-pointer'}
          disabled={isUploading}
          asChild={!isUploading}
        >
          <label className={'inline-flex items-center gap-1'}>
            <input
              type={'file'}
              accept={'image/jpeg, image/png, video/mp4, application/pdf'}
              onInput={(event) => {
                const fileList = event.currentTarget.files;
                if (!fileList) return;
                console.log('adding', fileList);
                onAddFiles(Array.from(fileList));
                event.currentTarget.value = '';
              }}
              multiple
              className={'hidden'}
              disabled={isUploading}
            />
            <PlusIcon />
            {assetCount === 0 ? 'Dodaj pliki...' : 'Dodaj więcej plików...'}
          </label>
        </Button>
        <Button
          onClick={onSubmit}
          disabled={assetCount === 0 || isUploading}
          className={'ml-auto inline-flex items-center gap-1'}
        >
          <UploadIcon /> Prześlij
        </Button>
      </Card>
    </div>
  );
}
