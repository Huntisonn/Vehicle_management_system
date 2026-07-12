// src/pages/dashboard/CustomerDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Car, Clock, CheckCircle, XCircle, ChevronRight, Heart, User, ShieldAlert } from 'lucide-react';
import { bookingAPI, userAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/layout/Sidebar';
import { TableSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const sidebarLinks = [
  { to: '/dashboard', icon: Car, label: 'Overview' },
  { to: '/dashboard?tab=bookings', icon: Calendar, label: 'My Bookings' },
  { to: '/dashboard?tab=wishlist', icon: Heart, label: 'Wishlist' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const statCards = [
  { key: 'upcoming', label: 'Upcoming', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-400/10', status: 'approved' },
  { key: 'active', label: 'Active', icon: Car, color: 'text-emerald-400', bg: 'bg-emerald-400/10', status: 'active' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-sky-400', bg: 'bg-sky-400/10', status: 'completed' },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', status: 'cancelled' },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const queryClient = useQueryClient();

  const { data: allBookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.getMyBookings({ limit: 100 }),
    select: (d) => d.data.data,
  });

  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userAPI.getWishlist(),
    select: (d) => d.data.data,
    enabled: activeTab === 'wishlist',
  });

  const cancelBooking = useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.cancel(id, reason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['my-bookings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    },
  });

  const counts = statCards.reduce((acc, { key, status }) => {
    acc[key] = allBookings?.filter((b) => b.status === status).length || 0;
    return acc;
  }, {});

  const recent = allBookings?.slice(0, 5) || [];

  return (
    <PageLayout>
      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        {/* We reuse the sidebar but make it work with the URL tab query params */}
        <Sidebar links={sidebarLinks} title="Customer" />

        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome */}
              <div>
                <h1 className="font-display font-bold text-3xl text-zinc-100">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-zinc-400 mt-1">Here's your rental activity at a glance.</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                  : statCards.map(({ key, label, icon: Icon, color, bg }) => (
                    <Card key={key} className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-2xl ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="text-3xl font-display font-bold text-zinc-100">{counts[key]}</div>
                      <div className="text-sm text-zinc-400 mt-0.5">{label}</div>
                    </Card>
                  ))
                }
              </div>

              {/* Recent bookings */}
              <Card>
                <Card.Header>
                  <Card.Title>Recent Bookings</Card.Title>
                  <Link to="/dashboard?tab=bookings" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </Link>
                </Card.Header>

                {isLoading ? (
                  <TableSkeleton rows={4} />
                ) : recent.length > 0 ? (
                  <div className="space-y-3">
                    {recent.map((booking) => {
                      const vehicle = booking.vehicle;
                      const img = vehicle?.images?.find((i) => i.isPrimary) || vehicle?.images?.[0];
                      return (
                        <div key={booking._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800 transition-colors">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                            {img ? (
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-zinc-100 truncate">
                              {vehicle?.make} {vehicle?.model}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {format(new Date(booking.startDate), 'MMM d')} →{' '}
                              {format(new Date(booking.endDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge status={booking.status} dot>{booking.status}</Badge>
                            <p className="text-sm font-semibold text-indigo-400 mt-1">
                              ₹{booking.totalAmount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No bookings yet</p>
                    <Link to="/vehicles" className="text-indigo-400 text-sm hover:text-indigo-300 mt-1 inline-block">
                      Browse vehicles →
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'bookings' && (
            <Card>
              <Card.Header>
                <div>
                  <Card.Title>My Bookings</Card.Title>
                  <p className="text-xs text-zinc-500 mt-1">Full history of your bookings and rentals</p>
                </div>
              </Card.Header>

              {isLoading ? (
                <TableSkeleton rows={6} />
              ) : allBookings?.length > 0 ? (
                <div className="space-y-4">
                  {allBookings.map((booking) => {
                    const vehicle = booking.vehicle;
                    const img = vehicle?.images?.find((i) => i.isPrimary) || vehicle?.images?.[0];
                    const isCancellable = ['pending', 'approved'].includes(booking.status);

                    return (
                      <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                            {img ? (
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-100">
                              {vehicle?.make} {vehicle?.model}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1">
                              {format(new Date(booking.startDate), 'MMM d, yyyy')} → {format(new Date(booking.endDate), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Duration: {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                          <div className="text-left sm:text-right">
                            <Badge status={booking.status} dot>{booking.status}</Badge>
                            <p className="text-base font-bold text-indigo-400 mt-1">
                              ₹{booking.totalAmount?.toLocaleString()}
                            </p>
                          </div>
                          {isCancellable && (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-lg mt-1"
                              loading={cancelBooking.isLoading}
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this booking?')) {
                                  cancelBooking.mutate({ id: booking._id, reason: 'Cancelled by customer' });
                                }
                              }}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">You haven't made any bookings yet</p>
                  <Link to="/vehicles">
                    <Button variant="outline" size="sm" className="mt-4">
                      Explore Vehicles
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'wishlist' && (
            <Card>
              <Card.Header>
                <Card.Title>My Wishlist</Card.Title>
              </Card.Header>

              {wishlistLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)}
                </div>
              ) : wishlist?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((v) => {
                    const img = v.images?.find((i) => i.isPrimary) || v.images?.[0];
                    return (
                      <div key={v._id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-700 transition-colors flex flex-col">
                        <div className="h-32 bg-zinc-800 relative">
                          {img ? (
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-zinc-100">{v.make} {v.model}</h4>
                            <p className="text-xs text-zinc-500 capitalize mt-0.5">{v.vehicleType} · {v.location?.city}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                            <div>
                              <span className="text-lg font-bold text-indigo-400">₹{v.pricing?.daily}</span>
                              <span className="text-xxs text-zinc-500">/day</span>
                            </div>
                            <Link to={`/vehicles/${v._id}`}>
                              <Button size="xs" variant="primary">Rent Now</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">Your wishlist is empty</p>
                  <Link to="/vehicles">
                    <Button variant="outline" size="sm" className="mt-4">
                      Browse and Save Vehicles
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomerDashboard;
