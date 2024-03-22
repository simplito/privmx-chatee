import { ActionIcon, TextInput, TextInputProps } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

export function SearchInput({
    value,
    onChange,
    ...props
}: // eslint-disable-next-line no-unused-vars
Omit<TextInputProps, 'onChange'> & { onChange: (newValue: string) => void }) {
    const input = useRef<HTMLInputElement>(null);
    const t = useTranslations('common');

    function clearInput() {
        input.current.value = '';
        onChange('');
    }

    return (
        <TextInput
            ref={input}
            onChange={(e) => onChange(e.target.value)}
            value={value}
            leftSection={<IconSearch size={16} />}
            placeholder={t('search')}
            size="xs"
            rightSection={
                <ActionIcon component="div" variant="subtle" size={'xs'}>
                    <IconX onClick={clearInput} size={16} />
                </ActionIcon>
            }
            {...props}
        />
    );
}
