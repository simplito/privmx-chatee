import { Badge, Checkbox, GridCol, Group } from '@mantine/core';
import classes from './styles.module.css';
import { User } from '@/lib/db/users/users';
import { useState } from 'react';
import { UserAvatar } from '@atoms/user-avatar/UserAvatar';

export function SelectableUser({ person, name }: { name: string; person: User }) {
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    return (
        <>
            <GridCol span={12}>
                <Checkbox
                    key={`${person.publicKey}`}
                    id={`${person.publicKey}`}
                    name={name}
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    classNames={{
                        root: classes.checkboxWrapper,
                        body: classes.body,
                        input: classes.checkbox,
                        labelWrapper: classes.label_wrapper,
                        label: classes.label
                    }}
                    tabIndex={-1}
                    label={
                        <Group gap={'xs'}>
                            <UserAvatar name={person.username} size={'xs'} />
                            {person.username}
                            {person.isStaff ? (
                                <Badge size="xs" variant="outline">
                                    Staff
                                </Badge>
                            ) : null}
                        </Group>
                    }
                    value={JSON.stringify({
                        userId: person.username,
                        publicKey: person.publicKey,
                        isAdmin: person.isStaff
                    })}
                    size="sm"
                    aria-label="Checkbox"
                />
            </GridCol>
        </>
    );
}
