import { API_ENDPOINTS } from '../constants/ApiEndpoints';
import { createQuery } from './helper';
import api from './httpClient';

export const nocInpectionApi = api.injectEndpoints({
   endpoints: builder => ({
      getTodo: builder.query(createQuery(API_ENDPOINTS.AUTH.SEND_OTP, 'GET')),
      getNocInspectionDetails: builder.query(createQuery(API_ENDPOINTS.AUTH.SEND_OTP, 'GET')),
      sendPdf: builder.mutation(createQuery(API_ENDPOINTS.AUTH.SEND_PDF, 'POST')),
      getRagDocs: builder.query(createQuery(API_ENDPOINTS.RAG.GET_ALL_DOCS, 'GET')),
      getChatSessions: builder.query(createQuery(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'GET')),
   }),
   overrideExisting: true,
});

export const {
   useLazyGetTodoQuery,
   useLazyGetNocInspectionDetailsQuery,
   useSendPdfMutation,
   useLazyGetRagDocsQuery,
   useLazyGetChatSessionsQuery,
} = nocInpectionApi;
