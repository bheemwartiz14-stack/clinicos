"use client";

import * as React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import type { FilePondErrorDescription, FilePondFile, FilePondServerConfigProps } from "filepond";
import { ImagePlus } from "lucide-react";
import { cn } from "@mediclinic/ui";

registerPlugin(FilePondPluginImagePreview);

type AvatarUploadFieldProps = {
  name: string;
  defaultValue?: string | null;
  className?: string;
};

export function AvatarUploadField({ name, defaultValue, className }: AvatarUploadFieldProps) {
  const [avatarUrl, setAvatarUrl] = React.useState(defaultValue ?? "");
  const [error, setError] = React.useState<string | null>(null);

  const server = React.useMemo<NonNullable<FilePondServerConfigProps["server"]>>(
    () => ({
      process: {
        url: "/api/uploads/images",
        method: "POST",
        withCredentials: true,
        onload: (response: string) => {
          const parsed = JSON.parse(response) as { url?: string };
          if (!parsed.url) {
            throw new Error("Upload response did not include a URL");
          }
          setAvatarUrl(parsed.url);
          setError(null);
          return parsed.url;
        },
        onerror: (response: string) => {
          try {
            const parsed = JSON.parse(response) as { error?: string };
            return parsed.error ?? "Unable to upload image";
          } catch {
            return "Unable to upload image";
          }
        }
      },
      revert: {
        url: "/api/uploads/images",
        method: "DELETE",
        withCredentials: true,
        onload: () => {
          setAvatarUrl("");
          setError(null);
          return "";
        }
      }
    }),
    []
  );

  function handleError(filePondError: FilePondErrorDescription | null) {
    setError(filePondError?.body ?? "Unable to upload image");
  }

  function handleRemoveFile(_error: FilePondErrorDescription | null, file: FilePondFile) {
    if (file.serverId && file.serverId === avatarUrl) {
      setAvatarUrl("");
    }
  }

  return (
    <div className={cn("grid gap-3 text-sm", className)}>
      <input type="hidden" name={name} value={avatarUrl} />
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="mb-2 block font-medium">Avatar image</span>
          <FilePond
            name="file"
            allowMultiple={false}
            maxFiles={1}
            acceptedFileTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
            labelIdle='Drag an image here or <span class="filepond--label-action">browse</span>'
            server={server}
            credits={false}
            onerror={handleError}
            onremovefile={handleRemoveFile}
          />
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF up to 5 MB.</p>
          {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
