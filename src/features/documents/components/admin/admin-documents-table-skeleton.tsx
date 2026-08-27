import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminDocumentsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Employee
              </TableHead>

              <TableHead>
                Document
              </TableHead>

              <TableHead>
                Type
              </TableHead>

              <TableHead>
                Department
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="w-12">
                <span className="sr-only">
                  Actions
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-md" />

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>

                <TableCell>
                  <Skeleton className="size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}