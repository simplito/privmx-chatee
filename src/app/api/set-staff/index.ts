import { z } from 'zod';

export const setStaffRequestBodySchema = z.object({
    username: z.string(),
    isStaff: z.boolean()
});

export type SetStaffRequestBody = z.infer<typeof setStaffRequestBodySchema>;

export function generateSetStaffResponse() {
    return {
        message: 'User updated successfully'
    };
}

export type SetStaffResponse = ReturnType<typeof generateSetStaffResponse>;
