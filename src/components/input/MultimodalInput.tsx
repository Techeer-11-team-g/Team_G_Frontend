import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Camera, Mic, Send, X, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MultimodalInputProps {
  placeholder?: string;
  onSubmit: (data: { text?: string; image?: File }) => void;
  onFocus?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MultimodalInput({
  placeholder = '스타일을 설명하거나 이미지를 올려주세요...',
  onSubmit,
  onFocus,
  disabled = false,
  className,
}: MultimodalInputProps) {
  const [text, setText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    setPreviewImage(null);
    setSelectedFile(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!text.trim() && !selectedFile) return;

    onSubmit({
      text: text.trim() || undefined,
      image: selectedFile || undefined,
    });

    setText('');
    setPreviewImage(null);
    setSelectedFile(null);
  }, [text, selectedFile, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = text.trim() || selectedFile;

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="mb-3 relative inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/10">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <motion.div
        className={cn(
          'relative rounded-2xl',
          'bg-white/[0.03] border transition-all duration-300',
          isFocused ? 'border-accent/50' : 'border-white/10'
        )}
        animate={{
          boxShadow: isFocused
            ? '0 0 0 4px rgba(238, 52, 74, 0.1)'
            : '0 0 0 0px transparent',
        }}
      >
        {/* Main Input Area */}
        <div className="flex items-center gap-2 p-2">
          {/* Image Upload */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'bg-white/5 hover:bg-white/10 transition-colors',
              'disabled:opacity-30'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ImageIcon size={18} className="text-white/60" />
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={disabled}
          />

          {/* Camera */}
          <motion.button
            disabled={disabled}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'bg-white/5 hover:bg-white/10 transition-colors',
              'disabled:opacity-30'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera size={18} className="text-white/60" />
          </motion.button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 bg-transparent px-2 py-3',
              'text-white placeholder:text-white/30',
              'focus:outline-none',
              'disabled:opacity-30'
            )}
          />

          {/* Voice Input */}
          <motion.button
            disabled={disabled}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'bg-white/5 hover:bg-white/10 transition-colors',
              'disabled:opacity-30'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic size={18} className="text-white/60" />
          </motion.button>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={disabled || !hasContent}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'transition-colors',
              hasContent
                ? 'bg-accent hover:bg-accent-hover'
                : 'bg-white/5',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
            whileHover={hasContent ? { scale: 1.05 } : {}}
            whileTap={hasContent ? { scale: 0.95 } : {}}
          >
            <Send
              size={18}
              className={hasContent ? 'text-white' : 'text-white/30'}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Hint */}
      <motion.p
        className="mt-2 text-center text-xs text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Sparkles size={12} className="inline mr-1" />
        텍스트, 이미지, 또는 둘 다 입력할 수 있어요
      </motion.p>
    </motion.div>
  );
}
