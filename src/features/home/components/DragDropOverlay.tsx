import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';

export interface DragDropOverlayProps {
  onFileDrop: (file: File) => void;
}

export const DragDropOverlay = memo(function DragDropOverlay({ onFileDrop }: DragDropOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file?.type.startsWith('image/')) {
        onFileDrop(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFileDrop]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <motion.div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/40"
              animate={{
                borderColor: [
                  'rgba(255,255,255,0.4)',
                  'rgba(255,255,255,0.8)',
                  'rgba(255,255,255,0.4)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Camera size={32} className="text-white/60" />
            </motion.div>
            <p className="text-lg text-white/80">여기에 이미지를 놓아주세요</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
