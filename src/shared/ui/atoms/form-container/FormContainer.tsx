import {
    Box,
    BoxComponentProps,
    Grid,
    Paper,
    PaperProps,
    createPolymorphicComponent
} from '@mantine/core';
import React, { HTMLAttributes, forwardRef } from 'react';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';

interface FormContainerProps extends BoxComponentProps {
    withShadow?: boolean;
    containerProps?: PaperProps;
}

const _FormContainer = forwardRef<
    HTMLDivElement,
    FormContainerProps & HTMLAttributes<HTMLDivElement>
>(({ children, withShadow, mih, containerProps, ...props }, ref) => {
    return (
        <Box w={{ base: '100%', sm: 'auto' }} ref={ref} {...props}>
            <Paper
                shadow={withShadow ? 'xs' : undefined}
                radius={'lg'}
                mih={mih ?? 513}
                display={'flex'}
                style={{ flexDirection: 'column' }}
                {...containerProps}>
                <Grid
                    flex={1}
                    align="stretch"
                    gutter={'md'}
                    styles={{
                        root: { display: 'flex', flexDirection: 'column' },
                        inner: { flexGrow: 1 }
                    }}>
                    {children}
                </Grid>
            </Paper>
        </Box>
    );
});

_FormContainer.displayName = 'FormContainer';

const PolymorphicFormContainer = createPolymorphicComponent<'button', FormContainerProps>(
    _FormContainer
);

const FormContainer: typeof PolymorphicFormContainer & {
    LeftPanel: typeof LeftPanel;
    RightPanel: typeof RightPanel;
} = PolymorphicFormContainer as any;

FormContainer.LeftPanel = LeftPanel;
FormContainer.RightPanel = RightPanel;

export { FormContainer };
