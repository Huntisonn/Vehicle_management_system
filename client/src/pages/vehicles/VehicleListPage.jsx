// src/pages/vehicles/VehicleListPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { vehicleAPI } from '@/services/api';
import VehicleCard from '@/components/cards/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import PageLayout from '@/components/layout/PageLayout';
import { useDebounce } from '@/hooks/useDebounce';

const vehicleTypes = [
  { value: '', label: 'All Types' },
  { value: 'car', label: '🚗 Car' },
  { value: 'bike', label: '🏍️ Bike' },
  { value: 'scooter', label: '🛵 Scooter' },
  { value: 'suv', label: '🚙 SUV' },
  { value: 'van', label: '🚐 Van' },
  { value: 'truck', label: '🚛 Truck' },
];

const fuelTypes = [
  { value: '', label: 'All Fuels' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'cng', label: 'CNG' },
];

const transmissions = [
  { value: '', label: 'Any Transmission' },
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const VehicleListPage = () => {
  const [filters, setFilters] = useState({
    search: '', vehicleType: '', fuelType: '', transmission: '',
    city: '', minPrice: '', maxPrice: '', sort: '-createdAt',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  const queryParams = { ...filters, search: debouncedSearch, page, limit: 12 };
  // Remove empty keys
  Object.keys(queryParams).forEach((k) => !queryParams[k] && delete queryParams[k]);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', queryParams],
    queryFn: () => vehicleAPI.list(queryParams),
    select: (d) => d.data,
    keepPreviousData: true,
  });

  const vehicles = data?.data || [];
  const meta = data?.meta;

  const setFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', vehicleType: '', fuelType: '', transmission: '', city: '', minPrice: '', maxPrice: '', sort: '-createdAt' });
    setPage(1);
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== 'sort' && v !== '');

  return (
    <PageLayout>
      <div className="pt-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl text-zinc-100 mb-2">Browse Vehicles</h1>
          <p className="text-zinc-400">
            {meta ? `${meta.total.toLocaleString()} vehicles available` : 'Find your perfect rental'}
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search make, model, or city..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <Select
            options={sortOptions}
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            placeholder={null}
            containerClass="w-48"
          />
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {hasActiveFilters && `(active)`}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" leftIcon={<X className="w-4 h-4" />} onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="glass rounded-2xl border border-zinc-800 p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Select label="Type" options={vehicleTypes} value={filters.vehicleType}
                onChange={(e) => setFilter('vehicleType', e.target.value)} placeholder="All Types" />
              <Select label="Fuel" options={fuelTypes} value={filters.fuelType}
                onChange={(e) => setFilter('fuelType', e.target.value)} placeholder="All Fuels" />
              <Select label="Transmission" options={transmissions} value={filters.transmission}
                onChange={(e) => setFilter('transmission', e.target.value)} placeholder="Any" />
              <Input label="City" placeholder="e.g. Mumbai" value={filters.city}
                onChange={(e) => setFilter('city', e.target.value)} />
              <Input label="Min Price (₹/day)" type="number" placeholder="0" value={filters.minPrice}
                onChange={(e) => setFilter('minPrice', e.target.value)} />
              <Input label="Max Price (₹/day)" type="number" placeholder="∞" value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value)} />
            </div>
          </div>
        )}

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <VehicleCardSkeleton key={i} />)
            : vehicles.length > 0
            ? vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)
            : (
              <div className="col-span-full text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">No vehicles found</h3>
                <p className="text-zinc-500">Try adjusting your filters</p>
              </div>
            )
          }
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button variant="secondary" size="sm" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-zinc-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default VehicleListPage;
