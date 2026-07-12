// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car, MapPin, Shield, Star, Zap, Clock, ChevronRight,
  Users, TrendingUp, Award
} from 'lucide-react';
import { vehicleAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import VehicleCard from '@/components/cards/VehicleCard';
import PageLayout from '@/components/layout/PageLayout';

const stats = [
  { label: 'Happy Renters', value: '50K+', icon: Users },
  { label: 'Vehicles Listed', value: '2,000+', icon: Car },
  { label: 'Cities', value: '100+', icon: MapPin },
  { label: 'Avg Rating', value: '4.9★', icon: Star },
];

const features = [
  {
    icon: Zap,
    title: 'Instant Booking',
    desc: 'Book in under 2 minutes. No paperwork, no queues.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Shield,
    title: 'Fully Insured',
    desc: 'Every rental is covered with comprehensive insurance.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    desc: 'Round-the-clock assistance wherever you are.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: Star,
    title: 'Verified Owners',
    desc: 'All vehicles and owners are verified and reviewed.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

const LandingPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-vehicles'],
    queryFn: () => vehicleAPI.list({ limit: 6, sort: 'rating' }),
    select: (d) => d.data.data,
  });

  return (
    <PageLayout fullWidth>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm text-indigo-300 mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>Trusted by 50,000+ renters across India</span>
            </div>

            <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.05] text-zinc-100 mb-6 animate-slide-up">
              Rent Any Vehicle,{' '}
              <span className="gradient-text">Anywhere,</span>{' '}
              Anytime.
            </h1>

            <p className="text-xl text-zinc-400 leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              From city scooters to mountain SUVs — discover thousands of vehicles.
              Book instantly, ride confidently.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/vehicles">
                <Button variant="gradient" size="xl" rightIcon={<ChevronRight className="w-5 h-5" />}>
                  Browse Vehicles
                </Button>
              </Link>
              <Link to="/register?role=owner">
                <Button variant="secondary" size="xl">
                  List Your Vehicle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl gradient-brand flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-display font-black gradient-text">{value}</div>
                <div className="text-sm text-zinc-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-zinc-100 mb-4">
            Why Choose <span className="gradient-text">RentiGo?</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            We've reimagined vehicle rental from the ground up to be faster, safer, and more enjoyable.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="glass rounded-2xl p-6 border border-zinc-800 card-hover">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="font-display font-bold text-lg text-zinc-100 mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Vehicles ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display font-bold text-4xl text-zinc-100 mb-2">
              Featured Vehicles
            </h2>
            <p className="text-zinc-400">Top-rated vehicles ready to book today</p>
          </div>
          <Link to="/vehicles">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
            : data?.map((v) => <VehicleCard key={v._id} vehicle={v} />)
          }
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 gradient-brand opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative p-12 md:p-16 text-center">
            <Award className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
              Own a Vehicle? Start Earning.
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              List your vehicle on RentiGo and earn passive income. Join 2,000+ owners already earning on our platform.
            </p>
            <Link to="/register?role=owner">
              <Button
                variant="secondary"
                size="xl"
                className="!bg-white !text-indigo-700 hover:!bg-zinc-100 !border-transparent !shadow-2xl"
              >
                Become an Owner Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default LandingPage;
