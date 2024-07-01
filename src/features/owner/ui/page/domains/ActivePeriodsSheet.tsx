'use client';
import { Sheet } from '@/shared/ui/atoms/sheet/Sheet';
import {
    Stack,
    Group,
    Title,
    Divider,
    Grid,
    GridCol,
    ScrollArea,
    Text,
    Badge,
    ActionIcon,
    Button,
    Alert,
    Menu,
    MenuItem
} from '@mantine/core';
import {
    IconCalendarTime,
    IconCalendarX,
    IconDeviceFloppy,
    IconDotsVertical,
    IconPlus,
    IconX
} from '@tabler/icons-react';
import { AccessPeriod, Domain } from '@domains/data';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { FORM_STATUS, FormErrors, FormStatus } from '@utils/types';
import { FormLoadingButton } from '@/shared/ui/atoms/forn-loading-button/FormLoadingButton';
import { useTranslations } from 'next-intl';
import { useLocaleDate } from '@/shared/hooks/useLocaleDate';
import { disablePeriodAction, addActivePeriodAction, deleteActivePeriod } from '@owner/logic';

export function ActivePeriods({ domain }: { domain: Domain }) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formStatus, setFormStatus] = useState<FormStatus>(FORM_STATUS.DEFAULT);
    const [fieldErrors, setFieldErrors] = useState<FormErrors<{ range: '' }>>();

    const t = useTranslations();
    const { displayDate } = useLocaleDate();

    return (
        <Sheet p="lg">
            <Stack gap="lg">
                <Group justify="space-between">
                    <Title order={4}>{t('owner.domain.activePeriods.title')}</Title>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        variant="light"
                        onClick={() => setIsEditing((prv) => !prv)}>
                        {t('owner.domain.activePeriods.addPeriod')}
                    </Button>
                </Group>
                <Divider c="dimmed" />

                <Grid bg="gray.0" p="sm" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
                    <GridCol miw="fit-content" span={3}>
                        <Text c="dimmed" size="sm">
                            {t('owner.domain.activePeriods.startDate')}
                        </Text>
                    </GridCol>
                    <GridCol miw="fit-content" span={3}>
                        <Text c="dimmed" size="sm">
                            {t('owner.domain.activePeriods.endDate')}
                        </Text>
                    </GridCol>
                    <GridCol miw="fit-content" span={'auto'} c="dimmed">
                        <Text c="dimmed" size="sm">
                            {t('owner.domain.activePeriods.status')}
                        </Text>
                    </GridCol>
                    <GridCol span={1}></GridCol>
                </Grid>
                {isEditing && (
                    <>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setFormStatus(FORM_STATUS.LOADING);
                                const response = await addActivePeriodAction(
                                    { status: 'default' },
                                    new FormData(e.currentTarget)
                                );
                                if (response.status === 'field-error') {
                                    setFieldErrors(response.errors);
                                } else {
                                    setFormStatus(response.status);
                                }

                                if (response.status === 'success') {
                                    setIsEditing(false);
                                }
                            }}
                            style={{ width: '100%' }}>
                            <Group w="100%" align="flex-start">
                                <input type="hidden" name="domainName" value={domain.name} />
                                <DatePickerInput
                                    flex={1}
                                    name="range"
                                    type="range"
                                    placeholder="Pick dates range"
                                    error={fieldErrors?.range && fieldErrors?.range}
                                />
                                <Group justify="center" gap={'xs'}>
                                    <ActionIcon size={'lg'} type="submit">
                                        <IconDeviceFloppy size={'1rem'} />
                                    </ActionIcon>
                                    <ActionIcon
                                        onClick={() => setIsEditing(false)}
                                        size={'lg'}
                                        variant="light">
                                        <IconX size={'1rem'} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </form>
                        {formStatus === 'error' && (
                            <Alert color="red" title={t('owner.errors.unableToAddPeriod')} />
                        )}
                    </>
                )}
                <ScrollArea h={300} scrollbars="y">
                    {domain.accessPeriods.toSorted(sortActivePeriods).map((v) => (
                        <Grid key={v.id} px="sm" mb="sm">
                            <GridCol miw="fit-content" span={3}>
                                <Text>{displayDate(v.startTimestamp)}</Text>
                            </GridCol>
                            <GridCol miw="fit-content" span={3}>
                                <Text>{displayDate(v.endTimestamp)}</Text>
                            </GridCol>
                            <GridCol span={'auto'}>
                                <PeriodStatus period={v} />
                            </GridCol>
                            <GridCol span={1}>
                                <Group justify="flex-end">
                                    <Menu
                                        position="bottom-end"
                                        withinPortal={false}
                                        closeOnItemClick={false}>
                                        <Menu.Target>
                                            <ActionIcon variant="subtle">
                                                <IconDotsVertical size={'1rem'} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <form action={disablePeriodAction}>
                                                <input
                                                    type="hidden"
                                                    value={domain.name}
                                                    name="name"
                                                />
                                                <input type="hidden" value={v.id} name="id" />
                                                <input
                                                    type="hidden"
                                                    value={`${!v.active}`}
                                                    name="isActive"
                                                />
                                                <MenuItem
                                                    type="submit"
                                                    leftSection={
                                                        <FormLoadingButton>
                                                            <IconCalendarTime size={'1rem'} />
                                                        </FormLoadingButton>
                                                    }>
                                                    {v.active
                                                        ? t('common.block')
                                                        : t('common.unblock')}
                                                </MenuItem>
                                            </form>
                                            <form action={deleteActivePeriod}>
                                                <input type="hidden" name="id" value={v.id} />
                                                <input
                                                    type="hidden"
                                                    value={domain.name}
                                                    name="name"
                                                />
                                                <MenuItem
                                                    type="submit"
                                                    leftSection={
                                                        <FormLoadingButton>
                                                            <IconCalendarX size={'1rem'} />
                                                        </FormLoadingButton>
                                                    }
                                                    color="red">
                                                    {t('common.delete')}
                                                </MenuItem>
                                            </form>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </GridCol>
                        </Grid>
                    ))}
                </ScrollArea>
            </Stack>
        </Sheet>
    );
}

function PeriodStatus({ period }: { period: AccessPeriod }) {
    const t = useTranslations();

    if (period.endTimestamp < Date.now()) {
        return (
            <Badge variant="outline">{t('owner.domain.activePeriods.statusState.expired')}</Badge>
        );
    } else {
        if (period.active) {
            return (
                <Badge variant="filled">{t('owner.domain.activePeriods.statusState.active')}</Badge>
            );
        } else {
            return (
                <Badge variant="light">{t('owner.domain.activePeriods.statusState.blocked')}</Badge>
            );
        }
    }
}

function sortActivePeriods(a: AccessPeriod, b: AccessPeriod) {
    const validityA =
        a.active && a.endTimestamp > Date.now() ? a.endTimestamp : a.endTimestamp * -1;
    const validityB =
        b.active && b.endTimestamp > Date.now() ? b.endTimestamp : b.endTimestamp * -1;

    if (validityA === validityB) {
        return 0;
    } else if (validityA < validityB) {
        return 1;
    } else {
        return -1;
    }
}
