import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { Button } from '@/components/base/button';
import { TrashIcon } from '@/components/icons';
import { useState } from 'react';
import { cn } from '@/utils/styles';

interface TimelineRangeDeleteModalProps {
  timelineRangeId: number;
  onDelete: (timelineRangeId: number) => void;
  triggerClassName?: string;
}

export function TimelineRangeDeleteModal({ timelineRangeId, onDelete, triggerClassName }: TimelineRangeDeleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <ModalTrigger asChild>
        <Button
          size={'icon'}
          variant={'danger'}
          className={cn('gap-1', triggerClassName)}
        >
          <TrashIcon /> Usuń
        </Button>
      </ModalTrigger>
      <ModalContent className={'w-fit max-w-72'}>
        <ModalHeader>
          <ModalTitle className={'inline-flex items-center gap-2'}>
            <TrashIcon /> <span>Czy na pewno chcesz usunąć okres z osi czasu?</span>
          </ModalTitle>
          <ModalDescription className={'text-danger'}>Ta czynność jest nieodwracalna.</ModalDescription>
        </ModalHeader>
        <div className={'flex justify-end gap-1'}>
          <Button
            variant={'secondary'}
            onClick={() => setIsOpen(false)}
          >
            Anuluj
          </Button>
          <Button onClick={() => onDelete(timelineRangeId)}>Usuń</Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
