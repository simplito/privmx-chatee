import { SignUpFormStatus } from '@/lib/hooks/useSignUp';
import {
    Button,
    TextInput,
    Title,
    Text,
    Box,
    Center,
    Group,
    PasswordInput,
    Progress,
    Stack
} from '@mantine/core';
import { useDebouncedValue, useInputState } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInitialFocus } from '@/shared/hooks/useInitialFocus';
interface Requirement {
    re: RegExp;
    label: string;
}

export function SignUpForm({
    status,
    setStatus
}: {
    status: SignUpFormStatus;
    setStatus: Dispatch<SetStateAction<SignUpFormStatus>>;
}) {
    const [password1, setPassword1] = useInputState('');
    const [password2, setPassword2] = useInputState('');

    const tokenInput = useInitialFocus();

    const [passwordsEqual, setPasswordsEqual] = useState(true);

    const [areChecksDimmed, setAreChecksDimmed] = useState(true);

    const [username, setUsername] = useInputState('');
    const t = useTranslations();
    const requirements: Requirement[] = useMemo(
        () => [
            { re: /[0-9]/, label: t('signUp.form.requirements.numbers') },
            { re: /[a-z]/, label: t('signUp.form.requirements.smallCharacters') },
            { re: /[A-Z]/, label: t('signUp.form.requirements.bigCharacters') },
            {
                re: /[$&+,:;=?@#|'<>.^*()%!-]/,
                label: t('signUp.form.requirements.specialCharacters')
            }
        ],
        [t]
    );

    const getStrength = useCallback(
        (password: string) => {
            let multiplier = password.length > 5 ? 0 : 1;

            requirements.forEach((requirement) => {
                if (!requirement.re.test(password)) {
                    multiplier += 1;
                }
            });

            return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
        },
        [requirements]
    );
    const [strength] = useDebouncedValue(getStrength(password1), 200);

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement
            dimmed={areChecksDimmed}
            key={index}
            label={requirement.label}
            meets={requirement.re.test(password1)}
        />
    ));

    const bars = useMemo(
        () =>
            Array(4)
                .fill(0)
                .map((_, index) => (
                    <Progress
                        styles={{ section: { transitionDuration: '0ms' } }}
                        value={
                            password1.length > 0 && index === 0
                                ? 100
                                : strength >= ((index + 1) / 4) * 100
                                ? 100
                                : 0
                        }
                        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
                        key={index}
                        size={4}
                    />
                )),
        [password1, strength]
    );

    const [validStatus, setValidStatus] = useState({ isValid: true, message: '' });
    const [tokenValue, setTokenValue] = useInputState('');

    const isValid = strength === 100 && password1 === password2 && username.trim().length > 0;

    return (
        <>
            <Title ta="center" order={3}>
                {t('signUp.form.header')}
            </Title>

            <Stack gap="xs">
                <TextInput
                    ref={tokenInput}
                    label={t('signUp.form.inviteToken')}
                    value={tokenValue}
                    onChange={(e) => {
                        setValidStatus((prev) => ({ ...prev, isValid: true }));
                        setTokenValue(e);
                    }}
                    onFocus={() => {
                        setStatus('default');
                    }}
                    error={
                        status === 'invalid-token'
                            ? t('signUp.form.error.invalidInviteToken')
                            : !validStatus.isValid
                            ? validStatus.message
                            : ''
                    }
                    name="token"
                    placeholder="xxxx-xxxx-xxxx"
                />

                <TextInput
                    value={username}
                    onChange={setUsername}
                    name="username"
                    label={t('signUp.form.username')}
                    error={
                        status === 'credentials-in-use'
                            ? t('signUp.form.error.usernameIsTaken')
                            : ''
                    }
                    onFocus={() => {
                        setStatus('default');
                    }}
                />
                <div>
                    <PasswordInput
                        value={password1}
                        onChange={setPassword1}
                        placeholder=""
                        label={t('signUp.form.password')}
                        onFocus={() => {
                            setAreChecksDimmed(false);
                            setPasswordsEqual(true);
                        }}
                        onBlur={() => {
                            setPasswordsEqual(password2 === password1);
                        }}
                        required
                        name="password1"
                    />
                    <PasswordInput
                        value={password2}
                        onChange={setPassword2}
                        onFocus={() => {
                            setPasswordsEqual(true);
                        }}
                        onBlur={() => {
                            setPasswordsEqual(password2 === password1);
                        }}
                        error={
                            passwordsEqual
                                ? undefined
                                : t('signUp.form.requirements.passwordsAreNotEqual')
                        }
                        placeholder=""
                        label={t('signUp.form.repeatPassword')}
                        name="password2"
                        required
                    />

                    <Group gap={5} grow mt="xs" mb="md">
                        {bars}
                    </Group>

                    <PasswordRequirement
                        dimmed={areChecksDimmed}
                        label={t('signUp.form.requirements.passwordLength')}
                        meets={password1.length > 5}
                    />
                    {checks}
                </div>
            </Stack>
            <Button type="submit" disabled={!isValid}>
                {t('signUp.form.createAccount')}
            </Button>
        </>
    );
}

function PasswordRequirement({
    meets,
    label,
    dimmed
}: {
    dimmed: boolean;
    meets: boolean;
    label: string;
}) {
    const color = dimmed ? 'dimmed' : meets ? 'teal' : 'red';
    return (
        <Text component="div" c={color} mt={5} size="xs" opacity={dimmed ? 0.8 : 1}>
            <Center inline>
                {meets ? (
                    <IconCheck size="0.9rem" stroke={1.5} />
                ) : (
                    <IconX size="0.9rem" stroke={1.5} />
                )}
                <Box ml={7}>{label}</Box>
            </Center>
        </Text>
    );
}
