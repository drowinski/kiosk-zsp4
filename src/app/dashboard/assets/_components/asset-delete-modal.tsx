import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from '@/components/base/modal';
import { Button } from '@/components/base/button';
import { TrashIcon } from '@/components/icons';
import { useState } from 'react';
import { Asset } from '@/features/assets/assets.validation';
import { applyDeclension } from '@/utils/language';

interface AssetDeleteModalProps {
  assetIds: Set<Asset['id']>;
  onDelete: (assetIds: Set<Asset['id']>) => void;
}

export function AssetDeleteModal({ assetIds, onDelete }: AssetDeleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <ModalTrigger asChild>
        <Button className={'gap-1'}>
          <TrashIcon /> <span>Usuń</span>
        </Button>
      </ModalTrigger>
      <ModalContent className={'w-fit max-w-96'}>
        <ModalHeader>
          <ModalTitle className={'inline-flex items-center gap-2'}>
            <TrashIcon /> <span>Czy na pewno chcesz usunąć wybraną zawartość?</span>
          </ModalTitle>
          <ModalDescription>
            <span>
              Zamierzasz usunąć <span className={'font-bold'}>{assetIds.size}</span>{' '}
              {applyDeclension(assetIds.size, 'materiał', 'materiały', 'materiałów')}.
            </span>
            <br />
            <span className={'text-danger'}>Ta czynność jest nieodwracalna.</span>
          </ModalDescription>
        </ModalHeader>
        <div className={'flex justify-end gap-1'}>
          <Button
            variant={'secondary'}
            onClick={() => setIsOpen(false)}
          >
            Anuluj
          </Button>
          <Button
            onClick={() => onDelete(assetIds)}
            className={'gap-1'}
          >
            <TrashIcon />
            <span>Usuń</span>
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
