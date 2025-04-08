import { Tag } from '@/features/tags/tags.schemas';
import { cn } from '@/utils/styles';
import React, { Fragment, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/base/popover';
import { Button } from '@/components/base/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/base/command';
import { PlusIcon } from '@/components/icons';

interface TagComboboxProps {
  tags: Tag[];
  onSelect: (tagId: Tag['id']) => void;
  id?: string;
  className?: string;
  triggerButton?: React.ReactElement;
  icon?: React.ReactElement;
}

export function TagCombobox({ tags, onSelect, id, triggerButton, icon }: TagComboboxProps) {
  const [open, setOpen] = useState(false);

  if (icon) {
    icon = React.cloneElement(icon, {
      className: cn('opacity-0 group-data-[selected="true"]:opacity-100', icon.props.className)
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open) => setOpen(open)}
    >
      <PopoverTrigger asChild>
        {triggerButton ? (
          triggerButton
        ) : (
          <Button
            id={id}
            aria-expanded={open}
            className={'h-7 py-1'}
            aria-label={'Dodaj tag'}
          >
            {icon ? icon : <PlusIcon />}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className={'p-0'}>
        <Command>
          <CommandInput placeholder={'Wyszukaj tag...'} />
          <CommandList>
            <CommandEmpty>Nie znaleziono tagów.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => {
                    onSelect(tag.id);
                    setOpen(false);
                  }}
                  className={'group data-[selected="true"]:bg-primary data-[selected="true"]:text-primary-foreground'}
                >
                  {icon ? icon : <PlusIcon className={'opacity-0 group-data-[selected="true"]:opacity-100'} />}
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface TagSelectorProps {
  allTags: Tag[];
  initialSelectedTags?: Tag[];
  name?: string;
}

export function TagSelector({ allTags, initialSelectedTags, name }: TagSelectorProps) {
  const uniqueString = useMemo(() => crypto.randomUUID(), []); // value to ensure element IDs are unique

  const [selectedTagIds, setSelectedTagIds] = useState<Set<Tag['id']>>(
    initialSelectedTags ? new Set(initialSelectedTags.map((tag) => tag.id)) : new Set()
  );

  const selectedTags = allTags.filter((tag) => selectedTagIds.has(tag.id));
  const availableTags = allTags.filter((tag) => !selectedTagIds.has(tag.id));

  return (
    <div className={'flex gap-1'}>
      <div
        className={cn(
          'inline-flex flex-wrap items-center gap-1 border border-accent shadow-inner',
          'whitespace-nowrap rounded-xl bg-white px-3 py-1 text-sm font-medium text-black'
        )}
      >
        {selectedTags.map((tag, index) => (
          <Fragment key={tag.id}>
            <input
              type={'hidden'}
              name={name}
              value={tag.id}
            />
            <Button
              key={tag.id}
              id={`tag-${tag.id}-${uniqueString}`}
              className={cn(
                'inline-flex h-7 items-center justify-center gap-1 rounded-xl text-sm font-medium',
                'whitespace-nowrap bg-secondary text-secondary-foreground shadow-sm hover:brightness-110'
              )}
              onClick={() => {
                setSelectedTagIds((prev) => {
                  const set = new Set(prev);
                  set.delete(tag.id);
                  return set;
                });
                const nextTagId = selectedTags.at(index + 1)?.id;
                const nextElementId = nextTagId ? `tag-${nextTagId}-${uniqueString}` : `add-tag-${uniqueString}`;
                document.getElementById(nextElementId)?.focus();
              }}
              aria-label={`Tag "${tag.name}" - naciśnij, aby usunąć`}
            >
              {tag.name}
            </Button>
          </Fragment>
        ))}
        <TagCombobox
          id={`add-tag-${uniqueString}`}
          tags={availableTags}
          onSelect={(tagId) => setSelectedTagIds((prev) => new Set(prev).add(tagId))}
        />
      </div>
    </div>
  );
}
