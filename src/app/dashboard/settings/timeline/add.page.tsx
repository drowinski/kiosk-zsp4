import { Form, useActionData, ActionFunctionArgs, redirect } from 'react-router';
import { Input, InputErrorMessage } from '@/components/base/input';
import { createTimelineRangeSchema } from '@/features/timeline/timeline.validation';
import { timelineRepository } from '@/features/timeline/timeline.repository';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Button } from '@/components/base/button';
import { Label } from '@/components/base/label';

const createTimelineRangeForm = createTimelineRangeSchema;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: createTimelineRangeForm.transform((timelineRange) => {
      if (timelineRange.minDate === undefined) timelineRange.minDate = null;
      if (timelineRange.maxDate === undefined) timelineRange.maxDate = null;
      if (timelineRange.caption === undefined) timelineRange.caption = null;
      return timelineRange;
    }),
    async: true
  });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }
  let timelineRangeId;
  try {
    timelineRangeId = await timelineRepository.createTimelineRange(submission.value);
  } catch (_error) {
    const error = _error as { code: string };
    let errorMessage = 'Wystąpił błąd.';
    if (error?.code === '23P01') {
      errorMessage = 'Daty nie mogą pokrywać się z datami innego okresu.';
    }
    return { lastResult: submission.reply({ formErrors: [errorMessage] }) };
  }

  if (timelineRangeId === null) {
    return { lastResult: submission.reply({ formErrors: ['Wystąpił błąd.'] }) };
  }

  return redirect(new URL(request.url).pathname.replace(/\/[^/]*$/, `/${timelineRangeId}`));
}

export default function TimelineRangeAddPage() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult: actionData?.lastResult,
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: createTimelineRangeForm });
      console.log(result);
      return result;
    },
    defaultValue: {
      minDate: '',
      maxDate: '',
      caption: ''
    }
  });

  return (
    <div className={'flex flex-col gap-1'}>
      <h3 className={'text-xl font-bold'}>Dodaj okres do osi czasu</h3>
      <Form
        method={'post'}
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate
        className={'flex w-52 gap-1'}
      >
        <div className={'flex grow flex-col gap-1'}>
          <InputErrorMessage>{form.errors}</InputErrorMessage>
          <Label className={'w-full'}>
            Data początkowa
            <Input
              type={'date'}
              name={fields.minDate.name}
              defaultValue={fields.minDate.initialValue}
              className={'w-full'}
            />
          </Label>
          <InputErrorMessage>{fields.minDate.errors}</InputErrorMessage>
          <Label className={'w-full'}>
            Data końcowa
            <Input
              type={'date'}
              name={fields.maxDate.name}
              defaultValue={fields.maxDate.initialValue}
              className={'w-full'}
            />
          </Label>
          <InputErrorMessage>{fields.maxDate.errors}</InputErrorMessage>
          <Label className={'w-full'}>
            Podpis (opcjonalne)
            <Input
              placeholder={'Podpis...'}
              name={fields.caption.name}
              defaultValue={fields.caption.initialValue}
              className={'w-full'}
            />
          </Label>
          <Button
            type={'submit'}
            variant={'success'}
          >
            Dodaj
          </Button>
        </div>
      </Form>
    </div>
  );
}
