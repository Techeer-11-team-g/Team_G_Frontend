import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageCropperProps {
  image: string;
  aspectRatio?: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({
  image,
  aspectRatio = 3 / 4,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error('Failed to crop image:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={20} />
        </button>
        <h3 className="text-[13px] font-bold uppercase tracking-widest text-white/80">
          사진 자르기
        </h3>
        <button
          onClick={handleConfirm}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90"
        >
          <Check size={20} />
        </button>
      </header>

      {/* Cropper Area */}
      <div className="relative flex-1">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
          cropShape="rect"
          showGrid={true}
          classes={{
            containerClassName: 'bg-black',
            cropAreaClassName: 'border-2 border-white/50',
          }}
        />
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-6">
        <button
          onClick={() => setZoom(Math.max(1, zoom - 0.1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ZoomOut size={18} />
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className={cn(
            'h-1 w-40 appearance-none rounded-full bg-white/20',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white'
          )}
        />
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ZoomIn size={18} />
        </button>
      </div>

      {/* Aspect Ratio Info */}
      <div className="pb-8 text-center">
        <p className="text-[11px] text-white/40">3:4 비율로 잘립니다</p>
      </div>
    </div>
  );
}

// 이미지 크롭 유틸리티 함수
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/jpeg',
      0.9
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
