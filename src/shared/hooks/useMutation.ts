// 'use client';

// import { useCallback, useMemo, useState } from 'react';
// import { FormStatus } from '../utils/types';

// // ({function}:{function:(arg:A)=>T}
// export function useMutation<A, T>(mutation: (...arg: A[]) => Promise<T>) {
//     const [status, setStatus] = useState<FormStatus>('default');
//     const [result, setResult] = useState<T | undefined>(undefined);
//     const [error, setError] = useState<Error | undefined>(undefined);

//     const handleStartMutation = useCallback(
//         async (...args: A[]) => {
//             setStatus('loading');
//             try {
//                 const result = await mutation(...args);
//                 setStatus('success');
//                 setResult(result);
//             } catch (e) {
//                 setStatus('error');
//                 setError(error);
//             }
//         },
//         [error, mutation]
//     );

//     const returnHandle = useMemo(() => {
//         if ('')
//             return {
//                 mutation: handleStartMutation,
//                 status,
//                 result: status === 'success' ? (result as T) : undefined,
//                 error: status === 'error'
//             };
//     }, []);

//     return {
//         mutation: handleStartMutation,
//         status,
//         result: status === 'success' ? (result as T) : undefined,
//         error: status === 'error'
//     };
// }
