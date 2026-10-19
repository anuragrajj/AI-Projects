import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useDeleteDocumentMutation, useLazyGetRagDocsQuery } from "../services/apis";
import { uploadDocument } from "../services/documentApi";
import type { DocumentDto } from "../services/documentApi";
import { errorMessage } from "../services/helper";
import { CloseIcon, FileIcon, TrashIcon, UploadIcon } from "./icons";

type DocumentsModalProps = {
   onClose: () => void;
   onUploaded: (doc: DocumentDto) => void;
   onDeleted: (id: string) => void;
};

/**
 * Lists every document the user has uploaded (including ones still processing or that failed),
 * with upload and delete. Deleting also removes the document's vectors on the backend.
 */
export default function DocumentsModal({ onClose, onUploaded, onDeleted }: DocumentsModalProps) {
   const [getRagDocs] = useLazyGetRagDocsQuery();
   const [deleteDocument] = useDeleteDocumentMutation();

   const [docs, setDocs] = useState<DocumentDto[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isUploading, setIsUploading] = useState(false);
   const [confirmId, setConfirmId] = useState<string | null>(null);
   const [deletingId, setDeletingId] = useState<string | null>(null);
   const [error, setError] = useState("");
   const fileInputRef = useRef<HTMLInputElement>(null);

   const loadDocs = async () => {
      try {
         setDocs(await getRagDocs({}).unwrap());
      } catch (err) {
         setError(errorMessage(err, "Could not load documents"));
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      loadDocs();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when the modal opens
   }, []);

   useEffect(() => {
      const onKeyDown = (e: globalThis.KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
   }, [onClose]);

   const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // so picking the same file again still fires onChange
      if (!file) return;

      if (file.type !== "application/pdf") {
         setError("Only PDF files allowed");
         return;
      }

      setError("");
      setIsUploading(true);
      try {
         const doc = await uploadDocument(file);
         setDocs((prev) => [doc, ...prev]);
         onUploaded(doc);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Upload failed");
         // A document that failed processing is still saved (as "failed"): show it so it can be deleted.
         await loadDocs();
      } finally {
         setIsUploading(false);
      }
   };

   const handleDelete = async (id: string) => {
      setError("");
      setDeletingId(id);
      try {
         await deleteDocument({ pathParam: id }).unwrap();
         setDocs((prev) => prev.filter((d) => d.id !== id));
         setConfirmId(null);
         onDeleted(id);
      } catch (err) {
         setError(errorMessage(err, "Could not delete this document"));
      } finally {
         setDeletingId(null);
      }
   };

   return (
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
         <button
            aria-label="Close documents"
            onClick={onClose}
            className="absolute inset-0 animate-fade-in bg-canvas/80"
         />

         <div
            role="dialog"
            aria-modal="true"
            aria-label="Documents"
            className="relative flex max-h-[85vh] w-full max-w-xl animate-fade-up flex-col overflow-hidden rounded-xl border border-line bg-surface-raised shadow-pop"
         >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
               <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">Documents</h2>
                  <p className="mt-0.5 text-[12px] text-ink-dim tabular">
                     {isLoading ? "Loading…" : `${docs.length} document${docs.length !== 1 ? "s" : ""}`}
                  </p>
               </div>
               <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-fg transition-colors duration-150 hover:bg-accent-hover disabled:bg-surface-hover disabled:text-ink-faint"
               >
                  <UploadIcon className="h-4 w-4" />
                  {isUploading ? "Uploading…" : "Upload PDF"}
               </button>
               <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
               <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-ink-dim transition-colors duration-150 hover:border-line-strong hover:text-ink"
               >
                  <CloseIcon className="h-4 w-4" />
               </button>
            </div>

            {error && (
               <p
                  role="alert"
                  className="mx-5 mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-300"
               >
                  {error}
               </p>
            )}

            {/* List */}
            <div className="min-h-[8rem] flex-1 overflow-y-auto p-2">
               {!isLoading && docs.length === 0 && (
                  <p className="px-3 py-10 text-center text-[12.5px] text-ink-faint">
                     No documents yet. Upload a PDF to begin.
                  </p>
               )}

               {docs.map((doc) => {
                  const confirming = confirmId === doc.id;
                  const deleting = deletingId === doc.id;
                  return (
                     <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-surface-hover"
                     >
                        <FileIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                        <div className="min-w-0 flex-1">
                           <p className="truncate text-[13px] text-ink">{doc.file_name}</p>
                           <p className="mt-0.5 text-[11.5px] text-ink-dim tabular">
                              {doc.status === "ready"
                                 ? `${doc.chunk_count} chunks · ${new Date(doc.created_at).toLocaleDateString()}`
                                 : doc.status === "failed"
                                   ? "Processing failed"
                                   : "Processing…"}
                           </p>
                        </div>

                        {confirming ? (
                           <div className="flex shrink-0 items-center gap-1.5">
                              <button
                                 onClick={() => setConfirmId(null)}
                                 disabled={deleting}
                                 className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-55"
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={() => handleDelete(doc.id)}
                                 disabled={deleting}
                                 className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-[12px] font-medium text-rose-300 transition-colors duration-150 hover:bg-rose-500/20 disabled:opacity-55"
                              >
                                 {deleting ? "Deleting…" : "Delete"}
                              </button>
                           </div>
                        ) : (
                           <button
                              onClick={() => setConfirmId(doc.id)}
                              aria-label={`Delete ${doc.file_name}`}
                              className="shrink-0 rounded p-1.5 text-ink-faint transition-colors duration-150 hover:text-rose-400"
                           >
                              <TrashIcon className="h-[15px] w-[15px]" />
                           </button>
                        )}
                     </div>
                  );
               })}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-5 py-3">
               <p className="text-[11.5px] leading-relaxed text-ink-dim">
                  Deleting a document removes it from search. Chats that used it keep their history but can no longer
                  take new messages.
               </p>
            </div>
         </div>
      </div>
   );
}
