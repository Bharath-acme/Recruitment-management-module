import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Download } from "lucide-react";

// 🟢 Defines your Backend Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ResumeDialogProps {
  resumeUrl: string; // e.g., "uploads\invoice_7.pdf"
}

export function ResumeDialog({ resumeUrl }: ResumeDialogProps) {
  
  // 🟢 HELPER: Fix the URL format
  const getFullResumeUrl = (path: string) => {
    if (!path) return "";
    
    // 1. If it's already a full http link (e.g. AWS S3), return it as is
    if (path.startsWith("http")) return path;

    // 2. Replace Windows backslashes (\) with Forward slashes (/)
    const cleanPath = path.replace(/\\/g, "/");

    // 3. Remove leading slash if present to avoid double slashes
    const normalizedPath = cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath;

    // 4. Combine with Backend URL
    return `${API_BASE_URL}/${normalizedPath}`;
  };

  const finalUrl = getFullResumeUrl(resumeUrl);

  return (
    <Dialog className="max-w-7xl w-full h-[90vh] flex flex-col">
      <DialogTrigger asChild>
        <Button variant="outline" className="font-medium">
          Resume
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Resume Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 border rounded-lg overflow-hidden bg-white">
          {finalUrl ? (
            <iframe
              src={finalUrl}
              title="Resume Preview"
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No resume available
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button
            onClick={() => window.open(finalUrl, "_blank")}
            className="flex items-center gap-2"
            disabled={!finalUrl}
          >
            <Download size={18} />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}