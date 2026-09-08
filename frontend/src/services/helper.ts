
interface MutationArgs {
   pathParam?: string | number;
   params?: Record<string, string>;
   formData?: FormData;
   responseHandler?: (response: Response) => Promise<unknown>;
   headers?: Record<string, string> & { Accept?: string };
   otherurl?: string;
   [key: string]: unknown;
}

interface MutationResult {
   url: string;
   method: string;
   body?: unknown;
   headers?: Record<string, string>;
   responseHandler?: (response: Response) => Promise<unknown>;
}

export const createMutation = (url: string, method: string) => ({
   query: ({
      pathParam,
      params,
      formData,
      responseHandler,
      headers,
      otherurl,
      ...body
   }: MutationArgs = {}): MutationResult => {
      const mainUrl = otherurl ?? url;
      let tempUrl = pathParam ? `${mainUrl}/${pathParam}` : mainUrl;

      if (params) {
         const queryParams = new URLSearchParams(params).toString();
         if (queryParams) {
            tempUrl += `?${queryParams}`;
         }
      }

      const isStringify = headers?.Accept === 'text/csv';
      const bodyContent = formData ?? body;

      return {
         url: tempUrl,
         method,
         ...(method !== 'GET' && {
            body: isStringify ? JSON.stringify(bodyContent) : bodyContent,
         }),
         ...(headers && { headers }),
         ...(responseHandler && { responseHandler }),
      };
   },
});

// ─────────────────────────────────────────────

interface QueryArgs {
   pathParam?: string;
   [key: string]: unknown;
}

interface QueryResult {
   url: string;
   method: string;
   keepUnusedDataFor: number;
}

export const createQuery = (
   url: string,
   method: string,
   cacheTime: number = 180,
) => ({
   query: ({ pathParam = '', ...params }: QueryArgs = {}): QueryResult => {
      let tempUrl = pathParam ? `${url}/${pathParam}` : url;

      const queryParams = new URLSearchParams(
         params as Record<string, string>,
      ).toString();

      if (queryParams) {
         tempUrl += `?${queryParams}`;
      }

      return {
         url: tempUrl,
         method,
         keepUnusedDataFor: cacheTime,
      };
   },

});