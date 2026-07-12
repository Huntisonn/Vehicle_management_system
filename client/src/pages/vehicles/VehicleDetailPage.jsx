// src/pages/vehicles/VehicleDetailPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Star, Fuel, Gauge, Users, Calendar, Shield,
  ChevronLeft, ChevronRight, Heart, Share2, CheckCircle
} from 'lucide-react';
import { vehicleAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/context/AuthContext';
import BookingModal from '@/components/modals/BookingModal';
import { format } from 'date-fns';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [imageIdx, setImageIdx] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleAPI.getById(id),
    select: (d) => d.data.data,
  });

  const vehicle = data?.vehicle;
  const bookedDates = data?.bookedDates || [];

  if (isLoading) {
    return (
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!vehicle) return null;

  const images = vehicle.images || [];
  const currentImg = images[imageIdx];

  const features = vehicle.specifications?.features || [];

  return (
    <PageLayout>
      <div className="pt-4 animate-fade-in">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 mb-6 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden h-80 sm:h-96 bg-zinc-800 mb-3">
              {currentImg ? (
                <img src={currentImg.url} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🚗</div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImageIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImageIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imageIdx ? 'bg-white w-5' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImageIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imageIdx ? 'border-indigo-500' : 'border-zinc-700'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="font-display font-bold text-3xl text-zinc-100">
                  {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge status={vehicle.status} dot />
                  <Badge variant="info" size="sm">{vehicle.vehicleType}</Badge>
                  {vehicle.specifications?.year && (
                    <span className="text-sm text-zinc-400">{vehicle.specifications.year}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rating */}
            {vehicle.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(vehicle.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                  ))}
                </div>
                <span className="font-semibold text-zinc-200">{vehicle.averageRating}</span>
                <span className="text-zinc-500 text-sm">({vehicle.ratingCount} reviews)</span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-zinc-400 mb-5">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{vehicle.location?.city}, {vehicle.location?.state || vehicle.location?.country}</span>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Fuel, label: 'Fuel', value: vehicle.fuelType },
                { icon: Gauge, label: 'Transmission', value: vehicle.transmission },
                { icon: Users, label: 'Seats', value: vehicle.specifications?.seats ? `${vehicle.specifications.seats} Seats` : 'N/A' },
                { icon: Calendar, label: 'Year', value: vehicle.specifications?.year || 'N/A' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs text-zinc-500">{label}</div>
                    <div className="text-sm font-medium text-zinc-200 capitalize">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="glass rounded-2xl border border-zinc-700 p-5 mb-6">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4">Rental Pricing</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { period: 'Per Day', amount: vehicle.pricing?.daily },
                  { period: 'Per Week', amount: vehicle.pricing?.weekly },
                  { period: 'Per Month', amount: vehicle.pricing?.monthly },
                ].map(({ period, amount }) => amount && (
                  <div key={period}>
                    <div className="text-xl font-display font-bold text-indigo-400">
                      ₹{amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500">{period}</div>
                  </div>
                ))}
              </div>
              {vehicle.pricing?.securityDeposit > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center gap-2 text-xs text-zinc-400">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Security deposit: ₹{vehicle.pricing.securityDeposit.toLocaleString()} (refundable)
                </div>
              )}
            </div>

            {/* Book Button */}
            {vehicle.status === 'available' ? (
              isAuthenticated ? (
                <Button
                  fullWidth
                  size="lg"
                  variant="gradient"
                  onClick={() => setBookingOpen(true)}
                  leftIcon={<Calendar className="w-5 h-5" />}
                >
                  Book This Vehicle
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/login', { state: { from: { pathname: `/vehicles/${id}` } } })}
                >
                  Login to Book
                </Button>
              )
            ) : (
              <Button fullWidth size="lg" disabled>
                Not Available
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <div className="mt-10 glass rounded-2xl border border-zinc-800 p-6">
            <h2 className="font-display font-semibold text-xl text-zinc-100 mb-4">About this vehicle</h2>
            <p className="text-zinc-400 leading-relaxed">{vehicle.description}</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        vehicle={vehicle}
        bookedDates={bookedDates}
      />
    </PageLayout>
  );
};

export default VehicleDetailPage;
