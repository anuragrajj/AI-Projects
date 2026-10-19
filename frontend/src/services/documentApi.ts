// Shape the backend returns for a document (backend/src/rag/rag_schemas.py).
export type DocumentDto = {
   id: string;
   file_name: string;
   file_type: string | null;
   status: string;
   chunk_count: number;
   created_at: string;
};

// The token is saved to localStorage at login (LoginPage) and removed at logout.
function authHeaders(): HeadersInit {
   const token = localStorage.getItem("token");
   return token ? { Authorization: `Bearer ${token}` } : {};
}

// Uploads go through fetch rather than RTK Query: the shared base query forces a JSON Content-Type,
// which would break the multipart body.
export async function uploadDocument(file: File): Promise<DocumentDto> {
   const formData = new FormData();
   formData.append("file", file); // MUST match FastAPI param

   const response = await fetch(new URL("rag/documents/upload", import.meta.env.VITE_BASE_URL), {
      method: "POST",
      headers: authHeaders(), // no Content-Type: the browser sets the multipart boundary itself
      body: formData,
   });
   if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(typeof err?.detail === "string" ? err.detail : "Upload failed");
   }
   return response.json();
}
