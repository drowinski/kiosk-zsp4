import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { Button } from '@/components/base/button';
import { TrashIcon } from '@/components/icons';
import { useState } from 'react';

interface UserDeleteModalProps {
  userId: number;
  username: string;
  onDelete: (userId: number) => void;
}

export function UserDeleteModal({ userId, username, onDelete }: UserDeleteModalProps) {
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
            <TrashIcon /> <span>Czy na pewno chcesz usunąć użytkownika <span className={'font-bold'}>{username}?</span></span>
          </ModalTitle>
          <ModalDescription className={'text-danger'}>Ta czynność jest nieodwracalna.</ModalDescription>
        </ModalHeader>
        <div className={'flex justify-end gap-1'}>
          <Button variant={'secondary'} onClick={() => setIsOpen(false)}>Anuluj</Button>
          <Button onClick={() => onDelete(userId)}>Usuń</Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
