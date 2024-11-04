import { TextInput, Group, FileButton, ActionIcon, TextInputProps } from '@mantine/core';
import { IconFilePlus, IconSend } from '@tabler/icons-react';
import { useThreadContext } from '../../../logic/hooks/useThreadContext';
import { Dispatch, DragEventHandler, SetStateAction, useRef, useState } from 'react';
import styles from './style.module.css';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/shared/hooks/useNotification';

export function MessageInput({
                                 setFiles,
                                 ...props
                             }: { setFiles: Dispatch<SetStateAction<File[]>> } & TextInputProps) {
    const client = useThreadContext();
    const [resetKey, setResetKey] = useState<number>(0);
    const ref = useRef<HTMLInputElement>(null);
    const t = useTranslations();
    const { showError } = useNotification();

    const filterAndAddFiles = (files: File[]) => {
        const filesToInput: File[] = [];

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > 50_000_000) {
                showError(t('chat.chatFiles.error.errorFileTooBig', { name: files[i].name }));
            } else {
                filesToInput.push(files[i]);
            }
        }

        setFiles((prev) => [...prev, ...filesToInput]);
    };

    const handleFileChange = (files: File[]) => {
        filterAndAddFiles(files);
        setResetKey((prev) => prev + 1);
    };

    const handleDropFiles: DragEventHandler<HTMLInputElement> = (e) => {
        e.preventDefault();
        const newFiles: File[] = [];
        if (e.dataTransfer.files) {
            [...e.dataTransfer.files].forEach((file) => {
                newFiles.push(file);
            });
        }

        filterAndAddFiles(newFiles);
        if (ref.current) {
            ref.current.classList.remove(styles.dropZone);
        }
    };

    const handleDragEnter: DragEventHandler<HTMLInputElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (ref.current) {
            ref.current.classList.add(styles.dropZone);
        }
    };

    const handleDragLeave: DragEventHandler<HTMLInputElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (ref.current) {
            ref.current.classList.remove(styles.dropZone);
        }
    };

    return (
        <TextInput
            ref={ref}
            radius={'md'}
            name="text"
            mr={'lg'}
            rightSectionWidth={'4.5rem'}
            rightSection={
                <Group gap={4} justify="flex-end">
                    <FileButton key={resetKey} multiple onChange={handleFileChange}>
                        {(props) => (
                            <ActionIcon variant="subtle" {...props}>
                                <IconFilePlus size={'1rem'} />
                            </ActionIcon>
                        )}
                    </FileButton>
                    <ActionIcon type="submit">
                        <IconSend size={'1rem'} />
                    </ActionIcon>
                </Group>
            }
            bottom={16}
            left={16}
            right={16}
            placeholder={
                t('chat.chatMessageList.sendMessagePlaceholder') + `'${client.title}'`
            }
            size="sm"
            onDrop={handleDropFiles}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            {...props}
        />
    );
}
