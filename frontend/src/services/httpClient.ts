import {
    createApi,
    fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

interface ExtraOptions {
    appLoader?: boolean;
}

interface ApiCallLog {
    apiUrl: string;
    method: string;
    params: unknown;
    token: string | null;
    body: unknown;
}

const getToken = (): string | null => localStorage.getItem('token');

const fetchApi = async (
    args: string | FetchArgs,
    api: Parameters<BaseQueryFn>[1],
    extraOptions: ExtraOptions,
    baseUrl: string,
) => {
    const token = getToken();
    const url = typeof args === 'string' ? args : args.url;
    const fullUrl = `${baseUrl}${url}`;

    const logDetails: ApiCallLog = {
        apiUrl: fullUrl,
        method: typeof args === 'string' ? 'GET' : args.method || 'GET',
        params: typeof args === 'string' ? '' : args.params || '',
        token,
        body: typeof args === 'string' ? '' : args.body || '',
    };

    console.log('%cAPI Call Details:', 'color: dodgerblue; font-weight: bold', logDetails);

    const timeout = 30000;
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request Timeout')), timeout),
    );

    const baseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            if (token) {
                headers.set('x-csrf-token', token);
            }
            headers.set('Accept-Language', 'en');
            headers.set('Accept', 'application/json');
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    });

    try {
        const result = await Promise.race([
            baseQuery(args, api, extraOptions),
            timeoutPromise,
        ]);

        if (!result.error) {
            console.log(
                `%cAPI Response from ${url}:`,
                'color: green; font-weight: bold',
                result?.data,
            );
        } else {
            console.error('API Error:', {
                url,
                method: logDetails.method,
                error: result.error,
            });
        }

        return result;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('%cAPI Error:', 'color: red; font-weight: bold', error);
        return {
            error: { status: 'FETCH_ERROR', error: message } as FetchBaseQueryError,
        };
    }
};

const createBaseQuery = (baseUrl: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, ExtraOptions> =>
        (args, api, extraOptions) =>
            fetchApi(args, api, extraOptions ?? {}, baseUrl);

export const api = createApi({
    baseQuery: createBaseQuery('https://jsonplaceholder.typicode.com/'),
    endpoints: () => ({}),
});

export default api;