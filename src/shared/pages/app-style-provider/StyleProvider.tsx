import {
    Button,
    createTheme,
    CSSVariablesResolver,
    Input,
    MantineProvider,
    Modal,
    Paper,
    SegmentedControl
} from '@mantine/core';
import styles from '@pages/app-style-provider/styles.module.css';
import { ReactNode } from 'react';

const themeOverride = createTheme({
    primaryColor: 'dark',
    cursorType: 'pointer',
    primaryShade: {
        light: 5
    },
    components: {
        SegmentedControl: SegmentedControl.extend({
            styles(theme) {
                return {
                    root: {
                        backgroundColor: theme.colors.gray[0]
                    }
                };
            }
        }),
        Paper: Paper.extend({
            styles(theme, props) {
                return {
                    root: {
                        border: props.withBorder ? `0.067rem solid var(--paper-bd)` : '0'
                    }
                };
            }
        }),
        Input: Input.extend({
            classNames: { input: styles['input-override'] }
        }),
        Button: Button.extend({
            styles(theme, props) {
                if (props.c || props.color) return undefined;
                if (props.disabled) {
                    return {
                        root: {
                            '--_disabled-color': theme.colors.gray[3],
                            '--_disabled-bg': theme.colors.gray[1]
                        }
                    };
                } else if (props.variant === 'outline') {
                    return {
                        root: {
                            '--_button-color': theme.colors.gray[4],
                            '--_button-bd': `1px solid ${theme.colors.gray[3]}`
                        }
                    };
                } else {
                    return {};
                }
            }
        }),

        Modal: Modal.extend({
            classNames: {
                inner: styles.modal_inner
            },
            defaultProps: {
                size: 'xl',
                padding: 'lg',
                centered: true,
                radius: 'md',
                withCloseButton: false,
                transitionProps: {
                    transition: 'slide-up'
                },
                overlayProps: {
                    color: 'gray',
                    opacity: 0.25,
                    blur: 4,
                    style: { '--overlay-bg': '#adadb3' }
                }
            }
        })
    },
    colors: {
        gray: [
            '#f8f8f8',
            '#e6e6e7',
            '#cfcfd2',
            '#adadb3',
            '#71717a',
            '#5a5a60',
            '#4d4c52',
            '#434347',
            '#3c3b3e',
            '#252527'
        ]
    }
});

const resolver: CSSVariablesResolver = (theme) => {
    return {
        variables: {
            '--mantine-border': `0.067rem solid ${theme.colors.gray[1]}`,
            '--paper-bd': `${theme.colors.gray[1]}`
        },
        light: {
            '--mantine-color-placeholder': theme.colors.gray[3],
            '--mantine-color-text': theme.colors.gray[8],
            '--mantine-color-dimmed': theme.colors.gray[4],
            '--mantine-color-app-body': theme.colors.gray[0],
            '--mantine-input-bd': theme.colors.gray[1],
            '--overlay-bg': theme.colors.gray[2],
            '--mantine-color-dark-outline': theme.colors.gray[4],
            '--_disabled-color': theme.colors.gray[5],
            '--_disabled-bg': theme.colors.gray[0]
        },
        dark: {}
    };
};

export function StyleProvider({ children }: { children: ReactNode }) {
    return (
        <MantineProvider
            defaultColorScheme="light"
            theme={themeOverride}
            cssVariablesResolver={resolver}>
            {children}
        </MantineProvider>
    );
}
