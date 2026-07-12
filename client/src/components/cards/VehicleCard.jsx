// src/components/cards/VehicleCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, Star, Fuel, Gauge, Heart } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/services/api';
import { clsx } from 'clsx';

const VehicleCard = ({ vehicle, wishlisted = false }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const img = vehicle.images?.find((i) => i.isPrimary) || vehicle.images?.[0];

  const toggleWishlist = useMutation({
    mutationFn: () => userAPI.toggleWishlist(vehicle._id),
    onSuccess: () => queryClient.invalidateQueries(['wishlist']),
  });

  return (
    <div className="group rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden card-hover flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-zinc-800">
        {img ? (
          <img
            src={img.url}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🚗</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge status={vehicle.status} dot size="sm">
            {vehicle.status}
          </Badge>
        </div>

        {/* Wishlist */}
        {isAuthenticated && (
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist.mutate(); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all"
          >
            <Heart className={clsx('w-4 h-4', wishlisted ? 'text-red-500 fill-red-500' : 'text-white')} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.averageRating > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-medium">{vehicle.averageRating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-zinc-400 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{vehicle.location?.city}, {vehicle.location?.state || vehicle.location?.country}</span>
        </div>

        {/* Specs chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 text-xs text-zinc-400">
            <Fuel className="w-3 h-3" />
            {vehicle.fuelType}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 text-xs text-zinc-400">
            <Gauge className="w-3 h-3" />
            {vehicle.transmission}
          </span>
          {vehicle.specifications?.seats && (
            <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-xs text-zinc-400">
              {vehicle.specifications.seats} seats
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-indigo-400">
              ₹{vehicle.pricing?.daily?.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500">/day</span>
          </div>
          <Link to={`/vehicles/${vehicle._id}`}>
            <button className="px-4 py-2 rounded-xl text-sm font-medium text-white gradient-brand hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
