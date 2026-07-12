// src/pages/auth/ForgotPasswordPage.jsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Car } from 'lucide-react';
import { useState } from 'react';
import { authAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Invalid email') });

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">RentiGo</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="font-display font-bold text-2xl text-zinc-100 mb-3">Check your inbox</h1>
            <p className="text-zinc-400 mb-8">We've sent a password reset link to your email address. It expires in 10 minutes.</p>
            <Link to="/login">
              <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display font-bold text-3xl text-zinc-100 mb-2">Forgot password?</h1>
            <p className="text-zinc-400 mb-8">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Email address" type="email" placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} required {...register('email')} />
              <Button type="submit" fullWidth size="lg" loading={loading}>Send Reset Link</Button>
            </form>
            <Link to="/login" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm mt-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
