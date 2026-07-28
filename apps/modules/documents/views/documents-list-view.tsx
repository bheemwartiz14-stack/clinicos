"use client";

import Link from "next/link";
import { FileText, Trash2, File, Image, FileArchive, ExternalLink } from "lucide-react";
import { deleteDocumentAction } from "../actions/document.actions";
import type { DocumentRecord, DocumentCategoryRecord } from "../services/document.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function fileIcon(fileType: string | null) {
  if (!fileType) return <File className="h-4 w-4" />;
  if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />;
  return <FileArchive className="h-4 w-4" />;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AllDocumentsView({
  documents,
  categories,
}: {
  documents: DocumentRecord[];
  categories: DocumentCategoryRecord[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient Documents</h1>
        <p className="text-sm text-muted-foreground">All patient documents and records.</p>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Document</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Patient</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Category</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Type</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Date</TableHead>
                <TableHead className="px-5 py-4 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{fileIcon(doc.fileType)}</span>
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Link href={`/patients/${doc.patientId}`} className="font-medium hover:underline">
                      {doc.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge variant="outline">{doc.categoryName ?? "Uncategorized"}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-xs text-muted-foreground">{doc.fileType ?? "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <form action={deleteDocumentAction}>
                        <input type="hidden" name="id" value={doc.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {documents.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <FileText className="mb-4 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No documents found</h3>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
