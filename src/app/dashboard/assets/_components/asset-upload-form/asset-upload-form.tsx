import { z } from '@/lib/zod';
import { assetCreateSchema, AssetDatePrecision } from '@/features/assets/assets.validation';
import {
  FieldName,
  FormId,
  FormProvider,
  SubmissionResult,
  useField,
  useForm,
  useFormMetadata
} from '@conform-to/react';
import { cn } from '@/utils/styles';
import { Form, useNavigation } from 'react-router';
import { parseWithZod } from '@conform-to/zod';
import { useEffect, useState } from 'react';
import { InputErrorMessage } from '@/components/base/input';
import { Button } from '@/components/base/button';
import { Asset } from '@/features/assets/components/asset';
import { Card } from '@/components/base/card';
import { AssetDatePicker } from '@/features/assets/components/asset-date-picker';
import { TextArea } from '@/components/base/text-area';
import { Label } from '@/components/base/label';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/base/modal';
import { PlusIcon, SpinnerIcon, UploadIcon } from '@/components/icons';

export const assetFormSchema = z.object({
  assets: z
    .array(
      z
        .object({
          file: z.instanceof(File, { message: 'Dodaj plik. ' })
        })
        .merge(assetCreateSchema.omit({ fileName: true, mimeType: true, assetType: true }))
    )
    .min(1, { message: 'Dodaj pliki. ' })
});

export interface AssetUploadFormToolbarProps {
  formId: FormId<z.infer<typeof assetFormSchema>>;
  onAddFiles: (files: File[]) => void;
  isUploading?: boolean;
}

export function AssetUploadFormToolbar({ formId, onAddFiles, isUploading = false }: AssetUploadFormToolbarProps) {
  const form = useFormMetadata(formId);
  const fields = form.getFieldset();
  const assetFields = fields.assets.getFieldList();

  return (
    <div className={'sticky left-0 right-0 top-0'}>
      <Card className={'flex gap-2'}>
        <Button
          className={'cursor-pointer'}
          disabled={isUploading}
          asChild={!isUploading}
        >
          <label className={'inline-flex gap-1 items-center'}>
            <input
              type={'file'}
              accept={'image/jpeg, image/png, video/mp4'}
              onInput={(event) => {
                const fileList = event.currentTarget.files;
                if (!fileList) return;
                onAddFiles(Array.from(fileList));
                event.currentTarget.value = '';
              }}
              multiple
              className={'hidden'}
              disabled={isUploading}
            />
            <PlusIcon />
            {assetFields.length === 0 ? 'Dodaj pliki...' : 'Dodaj więcej plików...'}
          </label>
        </Button>
        <Button
          type={'submit'}
          disabled={assetFields.length === 0 || isUploading}
          className={'ml-auto inline-flex items-center gap-1'}
        >
          <UploadIcon /> Prześlij
        </Button>
      </Card>
    </div>
  );
}

export interface AssetUploadFormItemProps {
  fieldName: FieldName<z.infer<typeof assetFormSchema.shape.assets.element>, z.infer<typeof assetFormSchema>>;
  file: File;
  onUpdateFile: (file: File) => void;
  onRemoveAsset: () => void;
}

export function AssetUploadFormItem({ fieldName, file, onUpdateFile, onRemoveAsset }: AssetUploadFormItemProps) {
  const [field, form] = useField(fieldName);
  const fieldset = field.getFieldset();
  const dateFieldset = fieldset.date.getFieldset();

  const [fileObjectURL, setFileObjectURL] = useState<string | undefined>();

  useEffect(() => {
    const objectURL = URL.createObjectURL(file);
    setFileObjectURL(objectURL);
    return () => {
      URL.revokeObjectURL(objectURL);
      setFileObjectURL(undefined);
    };
  }, [file]);

  return (
    (<Card
      key={field.key}
      className={'flex flex-col gap-2 overflow-hidden rounded-xl'}
    >
      <div className={'flex h-48 items-center justify-center'}>
        <Asset
          fullUrl={fileObjectURL}
          assetType={file.type.split('/')[0] as never}
        />
      </div>
      <div className={'flex gap-1'}>
        <div className={'flex h-full min-w-0 grow items-center px-2'}>
          <div className={'overflow-hidden text-ellipsis whitespace-nowrap'}>{file.name}</div>
        </div>
        <Button asChild>
          <label>
            <input
              ref={(ref) => {
                if (!ref) return;
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                ref.files = dataTransfer.files;
              }}
              type={'file'}
              accept={'image/jpeg, image/png, video/mp4'}
              name={fieldset.file.name}
              onChange={(event) => {
                const fileList = event.currentTarget.files;
                if (!fileList) return;
                const file = fileList.item(0);
                if (!file) return;
                onUpdateFile(file);
              }}
              className={'hidden'}
            />
            Zmień plik...
          </label>
        </Button>
        {fieldset.file.errors && <InputErrorMessage>{fieldset.file.errors}</InputErrorMessage>}
        <Button
          type={'button'}
          onClick={onRemoveAsset}
        >
          Usuń
        </Button>
      </div>
      <Label className={'w-full'}>
        Opis
        <TextArea
          key={fieldset.description.key}
          name={fieldset.description.name}
          placeholder={'Opis'}
          className={'h-32 resize-none'}
          maxLength={512}
          defaultValue={file.name.replace(/\.[a-zA-Z0-9]+$/, '')}
        />
      </Label>
      {fieldset.description.errors && <InputErrorMessage>{fieldset.description.errors}</InputErrorMessage>}
      <Label asChild>Data</Label>
      <AssetDatePicker
        dateMin={{
          name: dateFieldset.dateMin.name,
          value: dateFieldset.dateMin.value
        }}
        dateMax={{
          name: dateFieldset.dateMax.name,
          value: dateFieldset.dateMax.value
        }}
        datePrecision={{
          name: dateFieldset.datePrecision.name,
          value: dateFieldset.datePrecision.initialValue as AssetDatePrecision | undefined
        }}
        orientation={'vertical'}
      />
      {fieldset.date.errors && <InputErrorMessage>{fieldset.date.errors}</InputErrorMessage>}
    </Card>)
  );
}

export interface AssetUploadFormProps {
  lastSubmissionResult?: SubmissionResult;
  className?: string;
}

export function AssetUploadForm({ lastSubmissionResult, className }: AssetUploadFormProps) {
  const navigation = useNavigation();
  const isUploading = navigation.state !== 'idle';

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
  const [files, setFiles] = useState<File[]>([]);

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

  const updateFile = (index: number, newFile: File) => {
    setFiles((prev) => {
      prev = Array.from(prev);
      prev[index] = newFile;
      return prev;
    });
  };

  return (
    <>
      <FormProvider context={form.context}>
        <Form
          method={'post'}
          id={form.id}
          onSubmit={form.onSubmit}
          encType="multipart/form-data"
          className={cn('flex flex-col gap-3', className)}
        >
          <AssetUploadFormToolbar
            formId={form.id}
            onAddFiles={(files) => createAssetFields(files)}
            isUploading={isUploading}
          />
          <div className={'grid grid-cols-3 gap-2'}>
            {assetFields.length > 0 ? (
              assetFields.map((assetField, index) => (
                <AssetUploadFormItem
                  key={assetField.key}
                  fieldName={assetField.name}
                  file={files[index]}
                  onUpdateFile={(file) => updateFile(index, file)}
                  onRemoveAsset={() => removeAssetField(index)}
                />
              ))
            ) : (
              <Card className={'col-span-3 flex justify-center font-medium text-muted'}>
                Kliknij &#34;Dodaj pliki...&#34; aby rozpocząć.
              </Card>
            )}
          </div>
        </Form>
      </FormProvider>
      <Modal open={isUploading}>
        <ModalContent
          className={'h-fit w-fit'}
          hideCloseButton
        >
          <ModalHeader>
            <ModalTitle className={'inline-flex items-center gap-2'}>
              <UploadIcon /> Przesyłanie plików
            </ModalTitle>
            <ModalDescription>Trwa przesyłanie, nie zamykaj tej strony!</ModalDescription>
          </ModalHeader>
          <div className={'flex justify-center'}>
            <SpinnerIcon className={'animate-spin text-xl'} />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
