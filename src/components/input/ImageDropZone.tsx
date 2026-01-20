import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageDropZoneProps {
  onImageSelect: (file: File) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageDropZone({
  onImageSelect,
  className,
  disabled = false,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [onImageSelect]
  );

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      e.target.value = '';
    },
    [handleFile]
  );

  const handleReset = useCallback(() => {
    setPreview(null);
  }, []);

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {preview ? (
          // Preview State
          <motion.div
            key="preview"
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative aspect-[3/4] max-w-[280px] mx-auto rounded-2xl overflow-hidden border border-white/10">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Analyzing overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-white/80">분석 준비 중...</p>
                </div>
              </motion.div>
            </div>

            {/* Reset button */}
            <motion.button
              onClick={handleReset}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} className="text-white" />
            </motion.button>
          </motion.div>
        ) : (
          // Upload State
          <motion.label
            key="upload"
            className={cn(
              'relative block aspect-[3/4] max-w-[280px] mx-auto',
              'rounded-2xl border-2 border-dashed cursor-pointer',
              'transition-all duration-300',
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/[0.02]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              {/* Icon */}
              <motion.div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center',
                  isDragging ? 'bg-accent/20' : 'bg-white/5'
                )}
                animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              >
                {isDragging ? (
                  <Upload size={32} className="text-accent" />
                ) : (
                  <ImageIcon size={32} className="text-white/40" />
                )}
              </motion.div>

              {/* Text */}
              <div className="text-center">
                <p className="text-white/80 font-medium mb-1">
                  {isDragging ? '여기에 놓으세요' : '이미지 업로드'}
                </p>
                <p className="text-xs text-white/40">
                  드래그하거나 탭하여 선택
                </p>
              </div>

              {/* Supported formats */}
              <div className="flex gap-2">
                {['JPG', 'PNG', 'WEBP'].map((format) => (
                  <span
                    key={format}
                    className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/40 font-mono"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-white/20 rounded-tl" />
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-white/20 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-white/20 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-white/20 rounded-br" />
          </motion.label>
        )}
      </AnimatePresence>

      {/* AI Hint */}
      {!preview && (
        <motion.div
          className="mt-4 flex items-center justify-center gap-2 text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles size={12} className="text-accent/60" />
          <span>AI가 스타일을 분석하고 완벽한 아이템을 찾아드려요</span>
        </motion.div>
      )}
    </motion.div>
  );
}
