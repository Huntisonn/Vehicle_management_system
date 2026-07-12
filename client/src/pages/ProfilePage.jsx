// src/pages/ProfilePage.jsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Lock, Camera } from 'lucide-react';
import { userAPI, authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('profile');

  const { register: regProfile, handleSubmit: hProfile } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const { register: regPass, handleSubmit: hPass, reset: resetPass } = useForm();

  const updateProfile = useMutation({
    mutationFn: (d) => userAPI.updateProfile(d),
    onSuccess: (res) => {
      updateUser(res.data.data);
      toast.success('Profile updated!');
    },
  });

  const changePassword = useMutation({
    mutationFn: (d) => authAPI.changePassword(d),
    onSuccess: () => { toast.success('Password changed!'); resetPass(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const uploadAvatar = useMutation({
    mutationFn: (formData) => userAPI.uploadAvatar(formData),
    onSuccess: (res) => updateUser(res.data.data),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    uploadAvatar.mutate(fd);
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto pt-4">
        <h1 className="font-display font-bold text-3xl text-zinc-100 mb-8">My Profile</h1>

        {/* Avatar */}
        <Card className="mb-6 text-center">
          <div className="relative inline-block">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/30" />
            ) : (
              <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center mx-auto">
                <span className="text-4xl font-bold text-white">{user?.name?.[0]}</span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
            </label>
          </div>
          <h2 className="font-display font-bold text-xl text-zinc-100 mt-3">{user?.name}</h2>
          <p className="text-zinc-400 text-sm capitalize">{user?.role}</p>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-800 rounded-xl mb-6">
          {['profile', 'password'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all capitalize
                ${tab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-100'}`}>
              {t === 'profile' ? 'Profile Info' : 'Change Password'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <Card>
            <form onSubmit={hProfile((d) => updateProfile.mutate(d))} className="space-y-4">
              <Input label="Full Name" leftIcon={<User className="w-4 h-4" />} {...regProfile('name')} />
              <Input label="Email" type="email" disabled value={user?.email || ''} leftIcon={<Mail className="w-4 h-4" />} />
              <Input label="Phone" leftIcon={<Phone className="w-4 h-4" />} {...regProfile('phone')} />
              <Button type="submit" loading={updateProfile.isLoading} fullWidth>Save Changes</Button>
            </form>
          </Card>
        )}

        {tab === 'password' && (
          <Card>
            <form onSubmit={hPass((d) => changePassword.mutate(d))} className="space-y-4">
              <Input label="Current Password" type="password" leftIcon={<Lock className="w-4 h-4" />}
                {...regPass('currentPassword', { required: true })} />
              <Input label="New Password" type="password" leftIcon={<Lock className="w-4 h-4" />}
                {...regPass('newPassword', { required: true, minLength: 8 })} />
              <Button type="submit" loading={changePassword.isLoading} fullWidth>Change Password</Button>
            </form>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
