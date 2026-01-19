import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, ChevronRight, Package, Settings, LogOut, Upload, X, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { InfoCard } from '@/components/ui/info-card';
import { Button } from '@/components/ui/button';
import { ImageCropper } from '@/components/ui/image-cropper';
import { BottomNavigation, PageHeader } from '@/components/layout';
import { useCartStore, useAuthStore, useUserStore } from '@/store';
import { useDaumPostcode } from '@/hooks';
import { userImagesApi, usersApi } from '@/api';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  address: string;
  addressDetail: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items: cartItems, clearCart } = useCartStore();
  const { logout } = useAuthStore();
  const { user, userImageUrl, setUserImageUrl, clearUser } = useUserStore();

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      name: user?.user_name || parsed?.name || '게스트',
      email: user?.user_email || parsed?.email || '',
      phone: user?.phone_number || parsed?.phone || '',
      photo: parsed?.photo || localStorage.getItem('user_profile_photo'),
      address: user?.address?.split(' ').slice(0, -1).join(' ') || parsed?.address || '',
      addressDetail: user?.address?.split(' ').slice(-1)[0] || parsed?.addressDetail || '',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [fullBodyPhoto, setFullBodyPhoto] = useState<string | null>(userImageUrl);
  const [isUploadingFullBody, setIsUploadingFullBody] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleAddressComplete = useCallback((addr: string) => {
    setEditForm((prev) => ({ ...prev, address: addr, addressDetail: '' }));
  }, []);

  const { openPostcode } = useDaumPostcode({
    onComplete: handleAddressComplete,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setEditForm((prev) => ({ ...prev, photo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullBodyPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 크롭 모달 열기
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setImageToCrop(null);

    // 로컬 미리보기
    const previewUrl = URL.createObjectURL(croppedBlob);
    setFullBodyPhoto(previewUrl);

    // Blob을 File로 변환하여 API 업로드
    const file = new File([croppedBlob], 'full-body.jpg', { type: 'image/jpeg' });

    setIsUploadingFullBody(true);
    try {
      const result = await userImagesApi.upload(file);
      setUserImageUrl(result.user_image_url);
      localStorage.setItem('user_full_body_photo', result.user_image_url);
      toast.success('전신 사진이 업로드되었습니다');
    } catch (error) {
      console.error('Full body photo upload failed:', error);
      toast.error('전신 사진 업로드에 실패했습니다');
      setFullBodyPhoto(userImageUrl); // 실패 시 원래 사진으로 복구
    } finally {
      setIsUploadingFullBody(false);
    }
  };

  const handleSave = async () => {
    setProfile(editForm);
    localStorage.setItem('user_profile', JSON.stringify(editForm));
    if (editForm.photo) {
      localStorage.setItem('user_profile_photo', editForm.photo);
    }

    // API로 주소 업데이트
    const fullAddress = editForm.addressDetail
      ? `${editForm.address} ${editForm.addressDetail}`
      : editForm.address;

    if (fullAddress) {
      try {
        await usersApi.updateProfile({
          address: fullAddress,
          phone_number: editForm.phone,
        });
        toast.success('프로필이 저장되었습니다');
      } catch (error) {
        console.error('Profile update failed:', error);
        toast.error('프로필 저장에 실패했습니다');
      }
    }

    setIsEditing(false);
  };

  const menuItems = [
    { icon: Package, label: '주문 내역', description: '구매한 상품 확인', path: '/orders' },
    { icon: Settings, label: '설정', description: '알림, 개인정보', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="프로필" showBack />

      <main className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-black/5 border-2 border-black/10 overflow-hidden shadow-xl">
              {(isEditing ? editForm.photo : profile.photo) ? (
                <img
                  src={(isEditing ? editForm.photo : profile.photo)!}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/10" />
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform overflow-hidden">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          {!isEditing ? (
            <>
              <h3 className="text-xl font-bold tracking-tight">{profile.name}</h3>
              <p className="text-[11px] text-black/40 font-medium">
                {profile.email || '이메일을 등록해주세요'}
              </p>
            </>
          ) : (
            <div className="w-full space-y-3 mt-4">
              <input
                type="text"
                placeholder="이름"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white border border-black/10 px-5 py-4 text-[13px] rounded-2xl outline-none focus:border-black/30 transition-all"
              />
              <input
                type="email"
                placeholder="이메일"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-white border border-black/10 px-5 py-4 text-[13px] rounded-2xl outline-none focus:border-black/30 transition-all"
              />
              <input
                type="tel"
                placeholder="전화번호"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-white border border-black/10 px-5 py-4 text-[13px] rounded-2xl outline-none focus:border-black/30 transition-all"
              />

              {/* 주소 입력 */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openPostcode}
                  className="w-full flex items-center gap-3 bg-white border border-black/10 px-5 py-4 rounded-2xl text-left hover:border-black/20 transition-colors"
                >
                  <MapPin size={18} className="text-black/30" />
                  <span className={editForm.address ? 'text-[13px]' : 'text-[13px] text-black/40'}>
                    {editForm.address || '주소 검색'}
                  </span>
                  <Search size={16} className="ml-auto text-black/30" />
                </button>
                {editForm.address && (
                  <input
                    type="text"
                    placeholder="상세 주소 입력"
                    value={editForm.addressDetail}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, addressDetail: e.target.value }))}
                    className="w-full bg-white border border-black/10 px-5 py-4 text-[13px] rounded-2xl outline-none focus:border-black/30 transition-all"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
          {!isEditing ? (
            <Button className="flex-1" onClick={() => setIsEditing(true)}>
              프로필 수정
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setEditForm(profile);
                  setIsEditing(false);
                }}
              >
                취소
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                저장
              </Button>
            </>
          )}
        </div>

        {/* Full Body Photo Section */}
        {!isEditing && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-black/20 px-1">
              전신 사진
            </h4>
            <div className="flex justify-center">
              {fullBodyPhoto ? (
                <div className="relative">
                  <div className="w-40 h-60 rounded-3xl bg-black/5 border-2 border-black/10 overflow-hidden shadow-xl">
                    <img
                      src={fullBodyPhoto}
                      alt="Full body"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFullBodyPhotoSelect}
                      disabled={isUploadingFullBody}
                    />
                    {isUploadingFullBody ? (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Camera size={18} className="text-black/60" />
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFullBodyPhoto(null);
                      setUserImageUrl('');
                      localStorage.removeItem('user_full_body_photo');
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="relative w-40 h-60 rounded-3xl bg-black/[0.03] border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-4 hover:bg-black/[0.05] hover:border-black/20 transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFullBodyPhotoSelect}
                    disabled={isUploadingFullBody}
                  />
                  {isUploadingFullBody ? (
                    <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <Upload size={24} className="text-black/30" />
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-semibold text-black/60">전신 사진 등록</p>
                        <p className="text-[10px] text-black/30 mt-1">가상 피팅에 사용됩니다</p>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!isEditing && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
            <InfoCard label="연락처">
              <p className="text-[14px] font-medium">
                {profile.phone || '전화번호를 등록해주세요'}
              </p>
            </InfoCard>
            <InfoCard label="배송 주소">
              <p className="text-[14px] font-medium">
                {profile.address
                  ? `${profile.address}${profile.addressDetail ? ` ${profile.addressDetail}` : ''}`
                  : '주소를 등록해주세요'}
              </p>
            </InfoCard>
          </div>
        )}

        {/* Menu Items */}
        {!isEditing && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-black/20 px-1">
              Menu
            </h4>
            <div className="bg-white rounded-4xl border border-black/5 overflow-hidden divide-y divide-black/5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full px-6 py-5 flex items-center gap-4 hover:bg-black/[0.02] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <item.icon size={18} className="text-black/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold">{item.label}</p>
                    <p className="text-[10px] text-black/40">{item.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-black/20" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        {!isEditing && (
          <button
            onClick={() => {
              // 모든 사용자 데이터 초기화
              logout();
              clearUser();
              clearCart();
              queryClient.clear(); // React Query 캐시 전체 초기화
              localStorage.removeItem('user_profile');
              localStorage.removeItem('user_profile_photo');
              localStorage.removeItem('user_full_body_photo');
              navigate('/');
            }}
            className="w-full py-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest font-black text-black/30 hover:text-black/60 transition-colors animate-in fade-in slide-in-from-bottom-3 duration-500 delay-400"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        )}

        {/* Version Info */}
        <div className="text-center pt-8 pb-4">
          <p className="text-[9px] uppercase tracking-widest font-black text-black/10">
            Dres:sense v1.0.0
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartItems.length} />

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
