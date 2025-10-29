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

interface ResumeDialogProps {
  resumeUrl: string; // public URL or file path
}

export function ResumeDialog({ resumeUrl }: ResumeDialogProps) {
  return (
    <Dialog>
      {/* Resume Button */}
      <DialogTrigger asChild>
        <Button variant="outline" className="font-medium">
          Resume
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Resume Preview</DialogTitle>
        </DialogHeader>

        {/* PDF Preview */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-white">
          <iframe
            src={resumeUrl}
            title="Resume Preview"
            className="w-full h-full"
          ></iframe>
        </div>

        {/* Download Button */}
        <DialogFooter className="pt-4">
          <Button
            onClick={() => window.open(resumeUrl, "_blank")}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
