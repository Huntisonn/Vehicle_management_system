// src/pages/auth/ResetPasswordPage.jsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    try {
      setLoading(true);
      await authAPI.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <h1 className="font-display font-bold text-3xl text-zinc-100 mb-2">Set new password</h1>
        <p className="text-zinc-400 mb-8">Must be at least 8 characters with uppercase and a number.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="New Password" type={show ? 'text' : 'password'} placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={<button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
            error={errors.password?.message} required {...register('password')} />
          <Input label="Confirm Password" type={show ? 'text' : 'password'} placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />} error={errors.confirm?.message} required {...register('confirm')} />
          <Button type="submit" fullWidth size="lg" loading={loading}>Reset Password</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
