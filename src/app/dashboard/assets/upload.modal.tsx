import type { Route } from './+types/upload.modal';
import { parseWithZod } from '@conform-to/zod';
import { assetService } from '@/features/assets/.server/assets.service';
import { ReadStream } from 'node:fs';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { Link, useFetcher, useLocation, useNavigate } from 'react-router';
import { tryAsync } from '@/utils/try';
import { z } from '@/lib/zod';
import { assetCreateSchema } from '@/features/assets/assets.schemas';
import { useForm } from '@conform-to/react';
import { Card } from '@/components/base/card';
import { Button } from '@/components/base/button';
import { CheckIcon, PlusIcon, SpinnerIcon, TrashIcon, UploadIcon } from '@/components/icons';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { InputErrorMessage } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { TextArea } from '@/components/base/text-area';
import { status, StatusCodes } from '@/utils/status-response';
import { cn } from '@/utils/styles';
import { AssetThumbnail } from '@/features/assets/components/asset-thumbnail';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/base/modal';

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
    logger.warn('Submission validation failed.');
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
  const navigate = useNavigate();
  const location = useLocation();

  const callbackUrl: string = (location.state?.previousPathname ?? '') + (location.state?.previousSearch ?? '');
  const navigateBack = () => navigate(callbackUrl || '..');

  const formsRef = useRef<Map<string, AssetUploadFormRef> | null>(null);

  const formsMap = () => {
    if (!formsRef.current) {
      formsRef.current = new Map();
    }
    return formsRef.current;
  };

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const uploadAllForms = () => {
    if (formsMap().size === 0) return;
    setIsUploaded(false);
    setIsUploading(true);
    for (const form of formsMap().values()) {
      form.submit();
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

  const [formStatuses, setFormStatuses] = useState<Map<string, AssetUploadFormStatus>>(new Map());

  const setFormStatus = (key: string, status: AssetUploadFormStatus | null) => {
    setFormStatuses((prev) => {
      if (!status) {
        prev.delete(key);
      } else {
        prev.set(key, status);
      }
      return new Map(prev);
    });
  };

  useEffect(() => {
    if (formStatuses.size === 0 || !isUploading) return;
    if (Array.from(formStatuses.values()).every((status) => status === 'success')) {
      setIsUploaded(true);
      setIsUploading(false);
    }
  }, [formStatuses, isUploading]);

  return (
    <Modal
      onOpenChange={(open) => !open && navigateBack()}
      defaultOpen
    >
      <ModalContent
        className={'flex max-h-[95%] flex-col overflow-hidden'}
        hideCloseButton={isUploading}
      >
        <ModalHeader>
          <ModalTitle className={'flex gap-2'}>
            <UploadIcon />
            <span>{isUploaded ? 'Przesłane pliki' : 'Prześlij pliki'}</span>
          </ModalTitle>
          <ModalDescription className={'sr-only'}>Wybierz pliki do przesłania</ModalDescription>
        </ModalHeader>
        <div className={'flex h-full w-full flex-col gap-3 overflow-auto rounded-xl p-1'}>
          <div className={'flex flex-col gap-2'}>
            {fileCount > 0 &&
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
                  onDelete={() => {
                    deleteFile(key);
                    setFormStatus(key, null);
                  }}
                  onStatusChange={(status) => setFormStatus(key, status)}
                />
              ))}
            {!isUploading && !isUploaded && (
              <AssetUploadFormFileInput
                onAddFiles={addFiles}
                className={cn(fileCount === 0 && 'col-span-3')}
              />
            )}
          </div>
        </div>
        {!isUploading && !isUploaded && fileCount > 0 && (
          <Button
            onClick={uploadAllForms}
            disabled={isUploading}
          >
            Prześlij
          </Button>
        )}
        {isUploaded && (
          <Card className={'flex w-full flex-col items-center gap-1'}>
            <div className={'flex w-full items-center justify-center gap-2'}>
              <CheckIcon />
              <span>Zakończono przesyłanie!</span>
            </div>
            <Button
              variant={'success'}
              className={'w-full'}
              asChild
            >
              <Link
                to={`/dashboard/assets?isPublished=false&sortBy=createdAt&pageSize=${fileCount}`}
                reloadDocument
              >
                Zobacz przesłane materiały
              </Link>
            </Button>
          </Card>
        )}
      </ModalContent>
    </Modal>
  );
}

export interface AssetUploadFormRef {
  submit: () => void;
}

type AssetUploadFormStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface AssetUploadForm {
  initialFile?: File;
  onDelete?: () => void;
  onStatusChange?: (status: AssetUploadFormStatus) => void;
}

const AssetUploadForm = React.forwardRef<AssetUploadFormRef, AssetUploadForm>(
  ({ initialFile, onDelete, onStatusChange }, ref) => {
    const formRef = useRef<HTMLFormElement>(null);
    const fetcher = useFetcher<typeof action>();
    const isUploading = useMemo(() => fetcher.state !== 'idle', [fetcher]);
    const isUploaded = useMemo(() => fetcher.data?.success === true, [fetcher]);

    const [form, fields] = useForm({
      lastResult: fetcher.data?.lastResult,
      onValidate: ({ formData }) => parseWithZod(formData, { schema: assetFormSchema })
    });

    const handleSubmit = async () => {
      if (isUploading || isUploaded) return;
      await fetcher.submit(formRef.current, { method: 'post' });
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit
    }));

    const status: AssetUploadFormStatus = isUploaded ? 'success' : isUploading ? 'uploading' : 'idle';
    const [previousStatus, setPreviousStatus] = useState<AssetUploadFormStatus | undefined>(undefined);
    useEffect(() => {
      if (status === previousStatus) return;
      onStatusChange?.(status);
      setPreviousStatus(status);
    }, [isUploaded, isUploading, onStatusChange, previousStatus, status]);

    const [file, setFile] = useState<File | undefined>(initialFile);

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
      <Card className={'relative flex h-24 gap-2 overflow-hidden p-2'}>
        <div className={'flex aspect-square h-full items-center justify-center'}>
          {file && (
            <AssetThumbnail
              asset={file}
              className={'h-full w-full object-cover'}
            />
          )}
        </div>
        <fetcher.Form
          ref={formRef}
          method={'post'}
          id={form.id}
          onSubmit={handleSubmit}
          encType={'multipart/form-data'}
          className={'flex w-full gap-3'}
          aria-disabled={isUploading}
          hidden={isUploading || isUploaded}
        >
          <InputErrorMessage>{fields.file.errors}</InputErrorMessage>
          <Label className={'w-full'}>
            Opis
            <TextArea
              key={file?.name}
              name={fields.description.name}
              placeholder={'Opis'}
              maxLength={512}
              defaultValue={file?.name.replace(/\.[a-zA-Z0-9]+$/, '')}
              className={'h-full resize-none'}
            />
          </Label>
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
            hidden
          />
          <Button
            type={'button'}
            size={'icon'}
            onClick={() => onDelete?.()}
            aria-label={'Usuń'}
            className={'h-full'}
          >
            <TrashIcon />
          </Button>
          {fields.description.errors && <InputErrorMessage>{fields.description.errors}</InputErrorMessage>}
        </fetcher.Form>
        {isUploaded && (
          <div className={'flex h-full w-full items-center justify-center gap-2'}>
            <CheckIcon /> <span>Przesłano</span>
          </div>
        )}
        {isUploading && (
          <div className={'absolute inset-0 flex h-full w-full items-center justify-center bg-black/10'}>
            <Card className={'flex flex-col items-center justify-center gap-2'}>
              <span>Przesyłanie...</span>
              <SpinnerIcon className={'animate-spin text-xl'} />
            </Card>
          </div>
        )}
      </Card>
    );
  }
);
AssetUploadForm.displayName = 'AssetUploadForm';

interface AssetUploadFormFileInput {
  onAddFiles: (files: File[]) => void;
  className?: string;
}

function AssetUploadFormFileInput({ onAddFiles, className }: AssetUploadFormFileInput) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className={cn('flex gap-2', className)}>
      <div className={'flex h-full w-full flex-col gap-1 overflow-hidden'}>
        <div
          tabIndex={0}
          role={'button'}
          aria-label={'Dodaj pliki'}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const fileList = event.dataTransfer.files;
            if (!fileList) return;
            console.log('adding', fileList);
            onAddFiles(Array.from(fileList));
          }}
          className={cn(
            'flex h-full w-full cursor-pointer select-none overflow-hidden rounded-xl',
            'border-2 border-dashed border-primary bg-accent text-accent-foreground hover:bg-accent/50'
          )}
        >
          <div className={'flex h-full w-full flex-col items-center gap-1 p-4'}>
            <div className={'grow basis-0'} />
            <div className={'text-3xl'}>
              <PlusIcon />
            </div>
            <div className={'flex grow basis-0 flex-col items-center justify-end text-center text-muted'}>
              <span>Kliknij tutaj lub przeciągnij tutaj pliki</span>
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type={'file'}
          accept={'image/jpeg, image/png, video/mp4, application/pdf'}
          multiple
          className={'sr-only'}
          onChange={(event) => {
            const fileList = event.currentTarget.files;
            if (!fileList) return;
            console.log('adding', fileList);
            onAddFiles(Array.from(fileList));
            event.currentTarget.value = '';
          }}
        />
      </div>
    </Card>
  );
}
