import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, Package, Settings, LogOut } from 'lucide-react';
import { InfoCard } from '@/components/ui/info-card';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout';
import { useCartStore } from '@/store';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { items: cartItems } = useCartStore();
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved
      ? JSON.parse(saved)
      : {
          name: '게스트',
          email: '',
          phone: '',
          photo: localStorage.getItem('user_profile_photo'),
        };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

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

  const handleSave = () => {
    setProfile(editForm);
    localStorage.setItem('user_profile', JSON.stringify(editForm));
    if (editForm.photo) {
      localStorage.setItem('user_profile_photo', editForm.photo);
    }
    setIsEditing(false);
  };

  const menuItems = [
    { icon: Package, label: '주문 내역', description: '구매한 상품 확인', path: '/orders' },
    { icon: Settings, label: '설정', description: '알림, 개인정보', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 w-full px-6 py-6 z-sticky bg-background/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-md mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.4em] font-black">프로필</h2>
        </div>
      </header>

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
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
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
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
          {!isEditing ? (
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
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

        {/* Info Cards */}
        {!isEditing && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
            <InfoCard label="연락처">
              <p className="text-[14px] font-medium">
                {profile.phone || '전화번호를 등록해주세요'}
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
          <button className="w-full py-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest font-black text-black/30 hover:text-black/60 transition-colors animate-in fade-in slide-in-from-bottom-3 duration-500 delay-400">
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
    </div>
  );
}
