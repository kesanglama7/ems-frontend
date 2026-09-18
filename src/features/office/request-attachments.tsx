"use client";
import { useOfficeQuery, type Attachment } from "./api";
import { QueryFeedback } from "../../components/shared/admin/shared";
export function RequestAttachments({ id }: { id: string }) {
  const query = useOfficeQuery<Attachment[]>(
    "request-attachments",
    `/employee-requests/${id}/attachments`,
  );
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Bills and photos</h3>
      <QueryFeedback
        pending={query.isPending}
        error={query.isError}
        retry={query.refetch}
      />
      {query.data?.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No attachments.</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {query.data?.data.map((file) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden rounded-lg border"
          >
            <img
              src={file.url}
              alt={file.originalFileName}
              className="h-36 w-full object-contain"
            />
            <p className="truncate p-2 text-xs">{file.originalFileName}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
