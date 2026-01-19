import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingButton, ProgressIndicator, ImageCropper } from '@/components/ui';
import { userImagesApi } from '@/api';
import { useUserStore } from '@/store';

export function OnboardingStep2() {
  const navigate = useNavigate();
  const setUserImageUrl = useUserStore((state) => state.setUserImageUrl);

  const [photo, setPhoto] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setImageToCrop(null);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPhoto(previewUrl);
    // Blob을 File로 변환해서 저장
    const file = new File([croppedBlob], 'user-image.jpg', { type: 'image/jpeg' });
    setCroppedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      // 사진이 있으면 서버에 업로드
      if (croppedFile) {
        const result = await userImagesApi.upload(croppedFile);
        // 업로드된 이미지 URL을 store에 저장
        setUserImageUrl(result.user_image_url);
        toast.success('전신 사진이 등록되었습니다');
      }

      navigate('/onboarding/step3');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-6 py-6">
        <div className="max-w-md mx-auto">
          <ProgressIndicator currentStep={2} totalSteps={3} className="mb-6" />
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">
            Step 2 of 3
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-4">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">전신 사진 등록</h1>
            <p className="text-[13px] text-black/50">
              가상 피팅을 위해 전신 사진을 등록해주세요
            </p>
          </div>

          {/* Photo Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            {photo ? (
              <div className="relative">
                <div className="w-48 h-72 rounded-3xl bg-black/5 border-2 border-black/10 overflow-hidden shadow-xl">
                  <img
                    src={photo}
                    alt="Full body"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={14} />
                </button>
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePhotoSelect}
                  />
                  <Camera size={18} className="text-black/60" />
                </label>
              </div>
            ) : (
              <label className="relative w-48 h-72 rounded-3xl bg-black/[0.03] border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-4 hover:bg-black/[0.05] hover:border-black/20 transition-all group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePhotoSelect}
                />
                <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <Upload size={24} className="text-black/30" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-black/60">
                    전신 사진 등록
                  </p>
                  <p className="text-[11px] text-black/30 mt-1">
                    탭하여 업로드
                  </p>
                </div>
              </label>
            )}

            <p className="text-[11px] text-black/30 text-center max-w-[200px]">
              정면 전신 사진을 권장합니다. 가상 피팅에 사용됩니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="pt-4">
              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                다음
              </LoadingButton>
            </div>
          </form>

          {/* Skip Button */}
          <button
            type="button"
            onClick={() => navigate('/onboarding/step3')}
            className="w-full py-3 text-[12px] uppercase tracking-widest font-bold text-black/30 hover:text-black/60 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </main>

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          aspectRatio={3 / 4}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
}
