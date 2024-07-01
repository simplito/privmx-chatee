import { Avatar, AvatarProps, Tooltip, TooltipProps } from '@mantine/core';
import { forwardRef } from 'react';

const colorsMantine = [
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'green',
    'lime',
    'yellow',
    'orange'
] as const;

function getColorHash(str?: string) {
    if (!str) return colorsMantine[0];

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }

    return colorsMantine[Math.abs(hash) % 11];
}

const UserAvatar = forwardRef<
    HTMLDivElement,
    {
        name: string;
        isStaff?: boolean;
        tooltipProps?: Omit<TooltipProps, 'children' | 'label'>;
    } & AvatarProps
>(({ name, isStaff = false, tooltipProps, ...props }, ref) => {
    return (
        <Tooltip label={name} openDelay={300} {...tooltipProps}>
            <Avatar
                ref={ref}
                variant={isStaff ? 'outline' : 'light'}
                styles={{
                    placeholder: { opacity: 1 },
                    root: {
                        opacity: 0.8
                    }
                }}
                color={getColorHash(name)}
                {...props}>
                {name[0]}
            </Avatar>
        </Tooltip>
    );
});

UserAvatar.displayName = 'UserAvatar';

export { UserAvatar };
