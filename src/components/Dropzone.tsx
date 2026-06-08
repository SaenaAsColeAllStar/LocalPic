import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DropzoneProps {
  onFilesSelect: (files: File[]) => void;
  error: string | null;
}

export function Dropzone({ onFilesSelect, error }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [onFilesSelect]);

  return (
    <div className="w-full flex justify-center flex-col items-center gap-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg w-full"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#a1a1aa' : '#e4e4e7', // zinc-400 vs zinc-200
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-12 transition-colors duration-200 cursor-pointer base-bg",
          "hover:border-zinc-400 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]",
          isDragging ? "bg-zinc-50" : "bg-white"
        )}
      >
        <input
          type="file"
          accept="image/png, image/jpeg"
          multiple
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6"
          >
             <UploadCloud className={cn("w-8 h-8", isDragging ? "text-zinc-600" : "text-zinc-400")} />
          </motion.div>
          
          <h3 className="text-xl font-medium mb-2">Drag & Drop Images</h3>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-8">
             Supports PNG and JPG files. Batch conversion will process images sequentially.
          </p>

          <div className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all pointer-events-none">
            Select Files
          </div>
        </div>
      </motion.div>
    </div>
  );
}
