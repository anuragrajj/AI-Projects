import { API_ENDPOINTS } from '../constants/ApiEndpoints';
import { createQuery } from './helper';
import api from './httpClient';

export const nocInpectionApi = api.injectEndpoints({
   endpoints: builder => ({
      getTodo: builder.query(createQuery(API_ENDPOINTS.AUTH.SEND_OTP, 'GET')),
      getNocInspectionDetails: builder.query(createQuery(API_ENDPOINTS.AUTH.SEND_OTP, 'GET')),
      sendPdf: builder.mutation(createQuery(API_ENDPOINTS.AUTH.SEND_PDF, 'POST')),
   }),
   overrideExisting: true,
});

export const {
   useLazyGetTodoQuery,
   useLazyGetNocInspectionDetailsQuery,
   useSendPdfMutation,
} = nocInpectionApi;
