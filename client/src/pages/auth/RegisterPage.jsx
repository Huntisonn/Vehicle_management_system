// src/pages/auth/RegisterPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Car, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'owner']),
  phone: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer';

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data;
    try {
      setLoading(true);
      const result = await authRegister(payload);
      toast.success('Account created! Welcome to RentiGo 🎉');
      const role = result.user.role;
      navigate(role === 'owner' ? '/owner' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">RentiGo</span>
          </Link>
          <div>
            <h2 className="font-display font-black text-5xl text-white leading-tight mb-4">
              Join 50,000+<br />Happy Renters.
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Create your free account and start renting in minutes.
            </p>
            <div className="space-y-3">
              {['No hidden fees', 'Instant booking confirmation', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/50 text-sm">
            © 2024 RentiGo. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-950 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">RentiGo</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-zinc-100 mb-2">Create account</h1>
            <p className="text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role toggle */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">I want to</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-800 rounded-xl">
                {[{ value: 'customer', label: '🚗 Rent Vehicles' }, { value: 'owner', label: '🏢 List Vehicles' }].map(({ value, label }) => (
                  <label key={value} className="cursor-pointer">
                    <input type="radio" value={value} className="sr-only" {...register('role')} />
                    <div className={`text-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${selectedRole === value ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}>
                      {label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Input label="Full name" placeholder="John Doe" leftIcon={<User className="w-4 h-4" />} error={errors.name?.message} required {...register('name')} />
            <Input label="Email address" type="email" placeholder="you@example.com" leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} required {...register('email')} />
            <Input label="Phone number" type="tel" placeholder="+91 98765 43210" leftIcon={<Phone className="w-4 h-4" />} error={errors.phone?.message} {...register('phone')} />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              hint="Min 8 chars, uppercase, and number"
              error={errors.password?.message}
              required
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>

          <p className="text-xs text-zinc-500 text-center mt-6">
            By registering, you agree to our{' '}
            <a href="#" className="text-indigo-400">Terms</a> and{' '}
            <a href="#" className="text-indigo-400">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
