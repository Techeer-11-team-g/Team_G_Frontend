import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Package,
  Settings,
  LogOut,
  Upload,
  X,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCartStore, useAuthStore, useUserStore } from '@/store';
import { useDaumPostcode } from '@/hooks';
import { userImagesApi, usersApi } from '@/api';
import { cn } from '@/utils/cn';
import { haptic, easings, springs, containerVariants, itemVariants, durations } from '@/motion';
import { MainHeader } from '@/components/layout';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  address: string;
  addressDetail: string;
}

// Magnetic button component
function MagneticButton({
  children,
  onClick,
  className,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'ghost';
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variantStyles = {
    default: 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20',
    primary: 'bg-white text-black hover:bg-white/90',
    ghost: 'hover:bg-white/[0.03]',
  };

  return (
    <motion.button
      ref={ref}
      onClick={() => {
        haptic('tap');
        onClick?.();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      transition={springs.snappy}
      className={cn(
        'relative overflow-hidden backdrop-blur-xl rounded-xl',
        'transition-colors duration-300',
        'tracking-wider text-sm font-light',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}

// Glass card component
function GlassCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      transition={{ ...springs.gentle, delay }}
      className={cn(
        'relative overflow-hidden',
        'bg-white/[0.02] backdrop-blur-xl',
        'border border-white/[0.06]',
        'rounded-2xl',
        className
      )}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();
  const { logout } = useAuthStore();
  const { user, userImageUrl, setUserImageUrl, clearUser } = useUserStore();

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      name: user?.user_name || parsed?.name || 'Guest',
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setImageToCrop(null);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setFullBodyPhoto(previewUrl);

    const file = new File([croppedBlob], 'full-body.jpg', { type: 'image/jpeg' });

    setIsUploadingFullBody(true);
    try {
      const result = await userImagesApi.upload(file);
      setUserImageUrl(result.user_image_url);
      localStorage.setItem('user_full_body_photo', result.user_image_url);
      haptic('success');
      toast.success('전신 사진이 업로드되었습니다');
    } catch (error) {
      console.error('Full body photo upload failed:', error);
      haptic('error');
      toast.error('업로드 실패');
      setFullBodyPhoto(userImageUrl);
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

    const fullAddress = editForm.addressDetail
      ? `${editForm.address} ${editForm.addressDetail}`
      : editForm.address;

    if (fullAddress) {
      try {
        await usersApi.updateProfile({
          address: fullAddress,
          phone_number: editForm.phone,
        });
        haptic('success');
        toast.success('프로필이 저장되었습니다');
      } catch (error) {
        console.error('Profile update failed:', error);
        haptic('error');
        toast.error('저장 실패');
      }
    }

    setIsEditing(false);
  };

  const handleLogout = () => {
    haptic('tap');
    logout();
    clearUser();
    clearCart();
    queryClient.clear();
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_profile_photo');
    localStorage.removeItem('user_full_body_photo');
    navigate('/');
  };

  const menuItems = [
    { icon: Package, label: '주문내역', description: '주문 기록 보기', path: '/orders' },
    { icon: Settings, label: '설정', description: '앱 설정', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Main Header */}
      <MainHeader />

      {/* Sub Header - Glassmorphism */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.slow, ease: easings.smooth }}
        className="fixed top-14 left-0 right-0 z-40"
      >
        <div className="backdrop-blur-xl bg-black/50 border-b border-white/[0.06]">
          <div className="px-6 py-4 flex items-center justify-between">
            <MagneticButton
              onClick={() => navigate(-1)}
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 -ml-3"
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              <span className="tracking-[0.2em] text-xs uppercase font-light">뒤로</span>
            </MagneticButton>
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-light">
              프로필
            </span>
          </div>
        </div>
      </motion.header>

      <main className="pt-36 pb-24 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-md mx-auto space-y-8"
        >
          {/* Profile Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-6">
            {/* Avatar with glassmorphism border */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={springs.gentle}
                className="relative w-28 h-28 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-white/5"
              >
                <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-xl overflow-hidden border border-white/10">
                  {(isEditing ? editForm.photo : profile.photo) ? (
                    <img
                      src={(isEditing ? editForm.photo : profile.photo)!}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                      <span className="text-3xl font-extralight text-white/40 tracking-wider">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
              {isEditing && (
                <motion.label
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springs.bouncy}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-white text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-white/10"
                >
                  <Camera size={14} strokeWidth={1.5} />
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePhotoChange}
                  />
                </motion.label>
              )}
            </div>

            {/* Name & Email Display / Edit Form */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: durations.fast }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-extralight tracking-wider">{profile.name}</h2>
                  <p className="text-xs tracking-[0.2em] text-white/30 mt-2 uppercase">
                    {profile.email || '이메일 미등록'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: durations.fast }}
                  className="w-full space-y-5"
                >
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light">
                      이름
                    </label>
                    <motion.div
                      animate={{
                        borderColor: focusedField === 'name' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      }}
                      className="border-b border-white/10 transition-colors"
                    >
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent py-3 text-base font-light tracking-wide outline-none placeholder:text-white/20"
                        placeholder="이름 입력"
                      />
                    </motion.div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light">
                      이메일
                    </label>
                    <motion.div
                      animate={{
                        borderColor: focusedField === 'email' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      }}
                      className="border-b border-white/10 transition-colors"
                    >
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent py-3 text-base font-light tracking-wide outline-none placeholder:text-white/20"
                        placeholder="이메일 입력"
                      />
                    </motion.div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light">
                      전화번호
                    </label>
                    <motion.div
                      animate={{
                        borderColor: focusedField === 'phone' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      }}
                      className="border-b border-white/10 transition-colors"
                    >
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent py-3 text-base font-light tracking-wide outline-none placeholder:text-white/20"
                        placeholder="전화번호 입력"
                      />
                    </motion.div>
                  </div>

                  {/* Address Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light">
                      주소
                    </label>
                    <motion.button
                      type="button"
                      onClick={openPostcode}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center gap-3 border-b border-white/10 py-3 text-left hover:border-white/20 transition-colors"
                    >
                      <MapPin size={14} strokeWidth={1.5} className="text-white/30" />
                      <span
                        className={cn(
                          'text-base font-light tracking-wide',
                          editForm.address ? 'text-white' : 'text-white/20'
                        )}
                      >
                        {editForm.address || '주소 검색'}
                      </span>
                    </motion.button>
                    {editForm.address && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-b border-white/10"
                      >
                        <input
                          type="text"
                          value={editForm.addressDetail}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, addressDetail: e.target.value }))
                          }
                          className="w-full bg-transparent py-3 text-base font-light tracking-wide outline-none placeholder:text-white/20"
                          placeholder="상세 주소"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full pt-2">
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="edit-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <MagneticButton
                      onClick={() => setIsEditing(true)}
                      className="w-full py-4 px-6"
                    >
                      <span className="tracking-[0.15em] uppercase text-xs">프로필 수정</span>
                    </MagneticButton>
                  </motion.div>
                ) : (
                  <motion.div
                    key="save-cancel-btns"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex gap-3"
                  >
                    <MagneticButton
                      onClick={() => {
                        setEditForm(profile);
                        setIsEditing(false);
                      }}
                      className="flex-1 py-4 px-6"
                    >
                      <span className="tracking-[0.15em] uppercase text-xs">취소</span>
                    </MagneticButton>
                    <MagneticButton
                      onClick={handleSave}
                      variant="primary"
                      className="flex-1 py-4 px-6"
                    >
                      <span className="tracking-[0.15em] uppercase text-xs">저장</span>
                    </MagneticButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Full Body Photo Section */}
          <AnimatePresence>
            {!isEditing && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="space-y-4"
              >
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light">
                  가상 피팅 사진
                </p>
                <div className="flex justify-center">
                  {fullBodyPhoto ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="w-40 h-56 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                        <img
                          src={fullBodyPhoto}
                          alt="Full body"
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleFullBodyPhotoSelect}
                              disabled={isUploadingFullBody}
                            />
                            {isUploadingFullBody ? (
                              <motion.div
                                className="w-6 h-6 border border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
                            ) : (
                              <Camera size={20} strokeWidth={1.5} className="text-white/80" />
                            )}
                          </label>
                        </div>
                      </div>
                      <MagneticButton
                        onClick={() => {
                          setFullBodyPhoto(null);
                          setUserImageUrl('');
                          localStorage.removeItem('user_full_body_photo');
                        }}
                        variant="ghost"
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-black/80 border border-white/10 flex items-center justify-center"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </MagneticButton>
                    </motion.div>
                  ) : (
                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={springs.gentle}
                      className="w-40 h-56 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFullBodyPhotoSelect}
                        disabled={isUploadingFullBody}
                      />
                      {isUploadingFullBody ? (
                        <motion.div
                          className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                            <Upload size={18} strokeWidth={1.5} className="text-white/30" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-xs text-white/40 tracking-wider">사진 업로드</p>
                            <p className="text-[9px] text-white/20 tracking-wider">가상 피팅용</p>
                          </div>
                        </>
                      )}
                    </motion.label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Cards */}
          <AnimatePresence>
            {!isEditing && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="space-y-3"
              >
                <GlassCard className="p-5" delay={0.1}>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light mb-2">
                    연락처
                  </p>
                  <p className="text-sm font-light tracking-wide">
                    {profile.phone || '전화번호 미등록'}
                  </p>
                </GlassCard>
                <GlassCard className="p-5" delay={0.15}>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light mb-2">
                    주소
                  </p>
                  <p className="text-sm font-light tracking-wide">
                    {profile.address
                      ? `${profile.address}${profile.addressDetail ? ` ${profile.addressDetail}` : ''}`
                      : '주소 미등록'}
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Menu Items */}
          <AnimatePresence>
            {!isEditing && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="space-y-2"
              >
                {menuItems.map((item) => (
                  <motion.div key={item.label} variants={itemVariants}>
                    <MagneticButton
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <item.icon size={18} strokeWidth={1.5} className="text-white/50" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-light tracking-wider">{item.label}</p>
                        <p className="text-[10px] text-white/30 tracking-wider mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} className="text-white/20" />
                    </MagneticButton>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout Button */}
          <AnimatePresence>
            {!isEditing && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <MagneticButton
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-3 py-5"
                >
                  <LogOut size={14} strokeWidth={1.5} className="text-white/30" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-light">
                    로그아웃
                  </span>
                </MagneticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer - Glassmorphism */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 px-6 py-5 backdrop-blur-xl bg-black/50 border-t border-white/[0.06]"
      >
        <div className="flex items-center justify-between text-[9px] text-white/20 tracking-[0.2em] uppercase">
          <span>2025</span>
          <span className="font-light">Dressense</span>
        </div>
      </motion.footer>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <ImageCropper
            image={imageToCrop}
            aspectRatio={3 / 4}
            onCropComplete={handleCropComplete}
            onCancel={() => setImageToCrop(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
