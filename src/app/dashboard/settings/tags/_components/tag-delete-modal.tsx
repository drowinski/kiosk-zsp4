import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { Button } from '@/components/base/button';
import { TrashIcon } from '@/components/icons';
import { useState } from 'react';

interface TagDeleteModalProps {
  tagId: number;
  tagName: string;
  onDelete: (tagId: number) => void;
}

export function TagDeleteModal({ tagId, tagName, onDelete }: TagDeleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <ModalTrigger asChild>
        <Button
          size={'icon'}
          className={'gap-1'}
        >
          <TrashIcon /> Usuń
        </Button>
      </ModalTrigger>
      <ModalContent className={'w-fit max-w-72'}>
        <ModalHeader>
          <ModalTitle className={'inline-flex items-center gap-2'}>
            <TrashIcon />{' '}
            <span>
              Czy na pewno chcesz usunąć tag <span className={'font-bold'}>{tagName}?</span>
            </span>
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
          <Button onClick={() => onDelete(tagId)}>Usuń</Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
