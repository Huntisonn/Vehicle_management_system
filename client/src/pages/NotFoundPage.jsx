// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Car, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-center px-4">
    <div className="relative mb-8">
      <div className="text-[180px] font-display font-black gradient-text leading-none select-none">
        404
      </div>
      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
    </div>
    <h1 className="font-display font-bold text-3xl text-zinc-100 mb-3">Page Not Found</h1>
    <p className="text-zinc-400 mb-8 max-w-md">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div className="flex items-center gap-3">
      <Link to="/">
        <Button variant="gradient" leftIcon={<Home className="w-4 h-4" />}>
          Go Home
        </Button>
      </Link>
      <Link to="/vehicles">
        <Button variant="secondary" leftIcon={<Car className="w-4 h-4" />}>
          Browse Vehicles
        </Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
