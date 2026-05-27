import type { FileEntry } from "../lib/types";
import { FileItem } from "./FileItem";

interface FileListProps {
  files: FileEntry[];
  onRemove: (id: string) => void;
  isConverting: boolean;
}

export function FileList({ files, onRemove, isConverting }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-1 py-3">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onRemove={() => onRemove(file.id)}
          isConverting={isConverting}
        />
      ))}
    </div>
  );
}
