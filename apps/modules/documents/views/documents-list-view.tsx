"use client";

import Link from "next/link";
import { FileText, Download, Trash2, File, Image, FileArchive, ExternalLink } from "lucide-react";
import { useState } from "react";
import { uploadDocumentAction, deleteDocumentAction } from "../actions/document.actions";
import type { DocumentRecord, DocumentCategoryRecord } from "../services/document.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export function PatientDocumentsView({
  documents,
  categories,
  patientId,
  patientName,
}: {
  documents: DocumentRecord[];
  categories: DocumentCategoryRecord[];
  patientId: string;
  patientName: string;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patient Documents</h1>
          <p className="text-sm text-muted-foreground">{patientName}</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>Upload Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a report, scan, or document for this patient.</DialogDescription>
            </DialogHeader>
            <form action={uploadDocumentAction} onSubmit={() => setTimeout(() => setUploadOpen(false), 100)} className="grid gap-4">
              <input type="hidden" name="patientId" value={patientId} />
              <FormField label="Title" name="title" required placeholder="e.g. Blood Report - May 2026" />
              <SelectField label="Category" name="categoryId"
                options={[
                  { value: "", label: "No category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <FormField label="File URL" name="fileUrl" required placeholder="https://..." />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="File Type" name="fileType" placeholder="e.g. application/pdf" />
                <FormField label="File Size (bytes)" name="fileSize" type="number" min="0" />
              </div>
              <Button type="submit">Upload</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Document</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Category</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Type</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Size</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Uploaded By</TableHead>
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
                    <Badge variant="outline">{doc.categoryName ?? "Uncategorized"}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-xs text-muted-foreground">{doc.fileType ?? "—"}</TableCell>
                  <TableCell className="px-5 py-4 text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">{doc.uploadedByName ?? "—"}</TableCell>
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
              <h3 className="text-lg font-semibold">No documents</h3>
              <p className="mt-1 text-sm text-muted-foreground">Upload the first document for this patient.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
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
