import { API_ENDPOINTS } from '../constants/ApiEndpoints';
import { createMutation, createQuery } from './helper';
import api from './httpClient';

export const nocInpectionApi = api.injectEndpoints({
   endpoints: builder => ({
      getTodo: builder.query(createQuery(API_ENDPOINTS.AUTH.SEND_OTP, 'GET')),
      getNocInspectionDetails: builder.query(createQuery(API_ENDPOINTS.AUTH.SEND_OTP, 'GET')),
      sendPdf: builder.mutation(createQuery(API_ENDPOINTS.AUTH.SEND_PDF, 'POST')),
      register: builder.mutation(createMutation(API_ENDPOINTS.AUTH.REGISTER, 'POST')),
      getRagDocs: builder.query(createQuery(API_ENDPOINTS.RAG.GET_ALL_DOCS, 'GET')),
      // Pass the document id as pathParam; the backend also removes its vectors from Pinecone.
      deleteDocument: builder.mutation(createMutation(API_ENDPOINTS.RAG.GET_ALL_DOCS, 'DELETE')),
      getChatSessions: builder.query(createQuery(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'GET')),
      // The rest of the session endpoints hang off the same path; pass the tail as pathParam:
      //   `${sessionId}/document`, `${sessionId}/messages`, or just `sessionId` for delete.
      getSessionDocument: builder.query(createQuery(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'GET')),
      getSessionMessages: builder.query(createQuery(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'GET')),
      createChatSession: builder.mutation(createMutation(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'POST')),
      deleteChatSession: builder.mutation(createMutation(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'DELETE')),
      sendChatMessage: builder.mutation({
         ...createMutation(API_ENDPOINTS.RAG.GET_CHAT_SESSIONS, 'POST'),
         extraOptions: { timeout: 120000 }, // the answer is generated before the response comes back
      }),
   }),
   overrideExisting: true,
});

export const {
   useLazyGetTodoQuery,
   useLazyGetNocInspectionDetailsQuery,
   useSendPdfMutation,
   useRegisterMutation,
   useLazyGetRagDocsQuery,
   useDeleteDocumentMutation,
   useLazyGetChatSessionsQuery,
   useLazyGetSessionDocumentQuery,
   useLazyGetSessionMessagesQuery,
   useCreateChatSessionMutation,
   useDeleteChatSessionMutation,
   useSendChatMessageMutation,
} = nocInpectionApi;
