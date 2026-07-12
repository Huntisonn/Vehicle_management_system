// src/pages/auth/LoginPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await login(data);
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      const role = result.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">RentiGo</span>
          </Link>
          <div>
            <h2 className="font-display font-black text-5xl text-white leading-tight mb-4">
              Drive Your<br />Adventure.
            </h2>
            <p className="text-white/70 text-lg">
              Thousands of vehicles. One platform. Infinite possibilities.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>🔒 Bank-grade security</span>
            <span>·</span>
            <span>⚡ Instant booking</span>
            <span>·</span>
            <span>🌟 Verified owners</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-950">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">RentiGo</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-zinc-100 mb-2">Welcome back</h1>
            <p className="text-zinc-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-400 hover:text-zinc-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
            <p className="text-xs text-zinc-400 text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-400">
              <div className="p-2 rounded-lg bg-zinc-700/50">
                <div className="text-zinc-200 font-medium">Customer</div>
                <div>customer@demo.com</div>
              </div>
              <div className="p-2 rounded-lg bg-zinc-700/50">
                <div className="text-zinc-200 font-medium">Owner</div>
                <div>owner@demo.com</div>
              </div>
              <div className="p-2 rounded-lg bg-zinc-700/50">
                <div className="text-zinc-200 font-medium">Admin</div>
                <div>admin@demo.com</div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-2">Password: Demo@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
