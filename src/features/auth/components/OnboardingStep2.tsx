import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Upload, Camera, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ImageCropper } from '@/components/ui';
import { userImagesApi } from '@/api';
import { useUserStore } from '@/store';
import { cn } from '@/utils/cn';
import { haptic, easings, springs } from '@/motion';

// Progress Indicator Component
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'h-[2px] rounded-full transition-all duration-500',
            i < currentStep ? 'bg-white w-8' : i === currentStep ? 'bg-white/60 w-6' : 'bg-white/20 w-4'
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        />
      ))}
    </div>
  );
}

export function OnboardingStep2() {
  const navigate = useNavigate();
  const setUserImageUrl = useUserStore((state) => state.setUserImageUrl);

  const [photo, setPhoto] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      haptic('tap');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      haptic('tap');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setImageToCrop(null);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPhoto(previewUrl);
    const file = new File([croppedBlob], 'user-image.jpg', { type: 'image/jpeg' });
    setCroppedFile(file);
    haptic('success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptic('tap');
    setIsLoading(true);

    try {
      if (croppedFile) {
        const result = await userImagesApi.upload(croppedFile);
        setUserImageUrl(result.user_image_url);
        toast.success('Photo uploaded successfully');
      }
      haptic('success');
      navigate('/onboarding/step3');
    } catch (error) {
      console.error('Image upload failed:', error);
      haptic('error');
      toast.error('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: easings.smooth }}
      >
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => {
              haptic('tap');
              navigate('/onboarding/step1');
            }}
            className="flex items-center gap-2 text-[13px] tracking-[0.02em] text-white/60 hover:text-white transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span className="font-light">Back</span>
          </motion.button>
          <ProgressIndicator currentStep={2} totalSteps={3} />
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 px-6">
        <div className="h-[1px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-white/60 to-white"
            initial={{ width: '33%' }}
            animate={{ width: '66%' }}
            transition={{ duration: 0.8, ease: easings.smooth }}
          />
        </div>
      </div>

      <main className="relative min-h-screen flex flex-col justify-center px-6 py-24">
        <motion.div
          className="max-w-[380px] mx-auto w-full"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easings.smooth, delay: 0.1 }}
        >
          {/* Title */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.p
              className="text-[13px] tracking-[0.08em] uppercase text-white/40 font-light mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Step 2 of 3
            </motion.p>
            <h1 className="text-[clamp(2rem,6vw,2.8rem)] font-extralight leading-[1.1] tracking-[-0.02em]">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: easings.smooth }}
              >
                Full Body
              </motion.span>
              <motion.span
                className="block text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: easings.smooth }}
              >
                Photo
              </motion.span>
            </h1>
            <motion.p
              className="mt-4 text-[13px] text-white/40 font-light leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Upload for virtual try-on experience
            </motion.p>
          </motion.div>

          {/* Photo Upload Area */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {photo ? (
                <motion.div
                  key="photo"
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={springs.snappy}
                >
                  {/* Photo Container */}
                  <div className="relative w-44 h-60 rounded-2xl overflow-hidden">
                    {/* Glassmorphism frame */}
                    <div className="absolute inset-0 rounded-2xl border border-white/20 backdrop-blur-sm z-10 pointer-events-none" />

                    <img
                      src={photo}
                      alt="Full body"
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  {/* Remove button */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      haptic('tap');
                      setPhoto(null);
                      setCroppedFile(null);
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} className="text-white" />
                  </motion.button>

                  {/* Replace button */}
                  <label className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors z-20">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handlePhotoSelect}
                    />
                    <Camera size={16} className="text-white" />
                  </label>

                  {/* AI Badge */}
                  <motion.div
                    className="absolute top-3 left-3 px-2.5 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-1.5 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Sparkles size={10} className="text-white/70" />
                    <span className="text-[9px] tracking-wider uppercase text-white/70 font-light">
                      Try-on Ready
                    </span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.label
                  key="upload"
                  className={cn(
                    'relative w-44 h-60 rounded-2xl cursor-pointer group',
                    'backdrop-blur-xl border-2 border-dashed transition-all duration-300',
                    isDragging
                      ? 'bg-white/[0.08] border-white/40 scale-[1.02]'
                      : 'bg-white/[0.03] border-white/[0.15] hover:bg-white/[0.05] hover:border-white/30'
                  )}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePhotoSelect}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors"
                      animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                    >
                      <Upload size={22} className="text-white/40 group-hover:text-white/60 transition-colors" />
                    </motion.div>

                    {/* Text */}
                    <div className="text-center px-4">
                      <p className="text-[12px] text-white/50 font-light tracking-wide">
                        Full body photo
                      </p>
                      <p className="text-[10px] text-white/30 mt-1.5 font-light">
                        Tap or drag to upload
                      </p>
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-white/20 rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-white/20 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-white/20 rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-white/20 rounded-br-lg" />
                </motion.label>
              )}
            </AnimatePresence>

            {/* Tip */}
            <motion.p
              className="mt-6 text-[11px] text-white/30 text-center max-w-[200px] font-light leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Front-facing full body photo recommended for best results
            </motion.p>
          </motion.div>

          {/* Submit Button */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              className={cn(
                'group w-full py-4 rounded-xl',
                'flex items-center justify-center gap-3',
                'font-light tracking-[0.05em] text-[14px]',
                'transition-all duration-300',
                'backdrop-blur-xl border',
                !isLoading
                  ? 'bg-white text-black border-white hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]'
                  : 'bg-white/[0.05] text-white/30 border-white/[0.08] cursor-not-allowed'
              )}
              whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-[1.5px] border-black/20 border-t-black rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <span>Continue</span>
                  <motion.div
                    initial={{ x: 0, y: 0 }}
                    whileHover={{ x: 2, y: -2 }}
                    transition={springs.snappy}
                  >
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </motion.div>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Skip */}
          <motion.button
            type="button"
            onClick={() => {
              haptic('tap');
              navigate('/onboarding/step3');
            }}
            className="w-full mt-6 py-4 text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip for now
          </motion.button>
        </motion.div>
      </main>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ImageCropper
              image={imageToCrop}
              aspectRatio={3 / 4}
              onCropComplete={handleCropComplete}
              onCancel={() => setImageToCrop(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
