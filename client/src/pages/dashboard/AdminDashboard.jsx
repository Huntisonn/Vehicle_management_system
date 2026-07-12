// src/pages/dashboard/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users, Car, TrendingUp, Calendar, AlertTriangle,
  BarChart3, Shield, Settings, ChevronRight, Ban, Check, X, Trash2, ShieldCheck, MapPin
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminAPI, vehicleAPI } from '@/services/api';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/layout/Sidebar';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const sidebarLinks = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin?tab=users', icon: Users, label: 'Users' },
  { to: '/admin?tab=owners', icon: Shield, label: 'Owners' },
  { to: '/admin?tab=vehicles', icon: Car, label: 'Vehicles' },
  { to: '/admin?tab=bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin?tab=analytics', icon: TrendingUp, label: 'Analytics' },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // System general dashboard stats
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard(),
    select: (d) => d.data.data,
  });

  // Top charts and analytics metrics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.getAnalytics(),
    select: (d) => d.data.data,
  });

  // Full users list query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', activeTab],
    queryFn: () => adminAPI.getUsers({ limit: 100 }),
    select: (d) => d.data.data,
    enabled: activeTab === 'users' || activeTab === 'owners',
  });

  // Full system vehicles query
  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['admin-vehicles', activeTab],
    queryFn: () => adminAPI.getVehicles({ limit: 100 }),
    select: (d) => d.data.data,
    enabled: activeTab === 'vehicles',
  });

  // Full system bookings query
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings', activeTab],
    queryFn: () => adminAPI.getAllBookings({ limit: 100 }),
    select: (d) => d.data.data,
    enabled: activeTab === 'bookings',
  });

  // Moderate Owner (approve/reject)
  const moderateOwner = useMutation({
    mutationFn: ({ id, action, reason }) => adminAPI.moderateOwner(id, action, reason),
    onSuccess: (_, { action }) => {
      toast.success(`Owner registration ${action}ed`);
      queryClient.invalidateQueries(['admin-users', 'admin-dashboard']);
    },
  });

  // Toggle user block status
  const toggleBlockUser = useMutation({
    mutationFn: ({ id, block }) => adminAPI.toggleBlockUser(id, block),
    onSuccess: (_, { block }) => {
      toast.success(`User ${block ? 'Blocked' : 'Unblocked'}`);
      queryClient.invalidateQueries(['admin-users', 'admin-dashboard']);
    },
  });

  // Delete User (soft-delete)
  const deleteUser = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => {
      toast.success('User removed from system');
      queryClient.invalidateQueries(['admin-users', 'admin-dashboard']);
    },
  });

  // Moderate listing (approve/reject vehicle listing)
  const moderateListing = useMutation({
    mutationFn: ({ id, action, reason }) => vehicleAPI.moderateListing(id, action, reason),
    onSuccess: (_, { action }) => {
      toast.success(`Vehicle listing ${action}ed`);
      queryClient.invalidateQueries(['admin-vehicles', 'admin-dashboard']);
    },
  });

  const topStats = [
    { label: 'Total Users', value: dashboard?.totalUsers || 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: '+12%' },
    { label: 'Active Owners', value: dashboard?.totalOwners || 0, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+8%' },
    { label: 'Vehicles Listed', value: dashboard?.totalVehicles || 0, icon: Car, color: 'text-sky-400', bg: 'bg-sky-400/10', trend: '+23%' },
    { label: 'Total Bookings', value: dashboard?.totalBookings || 0, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+31%' },
    { label: 'Pending Owners', value: dashboard?.pendingOwners || 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '' },
    { label: 'Pending Listings', value: dashboard?.pendingListings || 0, icon: Car, color: 'text-red-400', bg: 'bg-red-400/10', trend: '' },
  ];

  const revenueChartData = (dashboard?.revenueData || []).map((r) => ({
    month: `${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][r._id.month]}`,
    revenue: r.revenue,
    bookings: r.bookings,
  }));

  const bookingPieData = (dashboard?.bookingStats || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  // Filter users by role
  const customersList = usersData?.filter(u => u.role === 'customer') || [];
  const ownersList = usersData?.filter(u => u.role === 'owner') || [];

  return (
    <PageLayout>
      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        <Sidebar links={sidebarLinks} title="Admin Panel" />

        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div>
                <h1 className="font-display font-bold text-3xl text-zinc-100">Admin Dashboard</h1>
                <p className="text-zinc-400 mt-1">Full system overview and management</p>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
                  : topStats.map(({ label, value, icon: Icon, color, bg, trend }) => (
                    <Card key={label}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        {trend && (
                          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            {trend}
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-display font-bold text-zinc-100">{value.toLocaleString()}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
                    </Card>
                  ))
                }
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue area chart */}
                <Card className="lg:col-span-2">
                  <Card.Header>
                    <Card.Title>Monthly Revenue</Card.Title>
                  </Card.Header>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#f4f4f5' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#adminRev)" strokeWidth={2} name="Revenue (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Booking status pie */}
                <Card>
                  <Card.Header>
                    <Card.Title>Booking Status</Card.Title>
                  </Card.Header>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={bookingPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {bookingPieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#f4f4f5' }} />
                      <Legend formatter={(v) => <span className="text-zinc-400 text-xs capitalize">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Manage Users', desc: `${dashboard?.totalUsers || 0} total users`, tabName: 'users', color: 'border-indigo-500/30 hover:border-indigo-500' },
                  { label: 'Approve Owners', desc: `${dashboard?.pendingOwners || 0} pending`, tabName: 'owners', color: 'border-amber-500/30 hover:border-amber-500' },
                  { label: 'Review Listings', desc: `${dashboard?.pendingListings || 0} pending`, tabName: 'vehicles', color: 'border-purple-500/30 hover:border-purple-500' },
                ].map(({ label, desc, tabName, color }) => (
                  <button key={label} onClick={() => setSearchParams({ tab: tabName })} className="text-left w-full">
                    <div className={`glass rounded-2xl border ${color} p-5 card-hover`}>
                      <div className="font-semibold text-zinc-100 mb-1">{label}</div>
                      <div className="text-sm text-zinc-400">{desc}</div>
                      <div className="flex items-center gap-1 text-indigo-400 text-sm mt-3">
                        Manage <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <Card>
              <Card.Header>
                <Card.Title>User Accounts</Card.Title>
              </Card.Header>
              {usersLoading ? (
                <TableSkeleton rows={5} />
              ) : customersList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-800 text-xs uppercase text-zinc-300">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {customersList.map((u) => (
                        <tr key={u._id} className="hover:bg-zinc-800/40">
                          <td className="p-3 text-zinc-200 font-medium">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">{u.phone || 'N/A'}</td>
                          <td className="p-3">
                            <Badge variant={u.isBlocked ? 'danger' : 'success'}>
                              {u.isBlocked ? 'Blocked' : 'Active'}
                            </Badge>
                          </td>
                          <td className="p-3 text-right flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => toggleBlockUser.mutate({ id: u._id, block: !u.isBlocked })}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                            <button
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                              onClick={() => { if(confirm('Delete user permanently?')) deleteUser.mutate(u._id); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-8">No customers registered</p>
              )}
            </Card>
          )}

          {activeTab === 'owners' && (
            <Card>
              <Card.Header>
                <Card.Title>Owner Accounts Moderation</Card.Title>
              </Card.Header>
              {usersLoading ? (
                <TableSkeleton rows={5} />
              ) : ownersList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-800 text-xs uppercase text-zinc-300">
                      <tr>
                        <th className="p-3">Name / Business</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Owner Status</th>
                        <th className="p-3 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {ownersList.map((o) => (
                        <tr key={o._id} className="hover:bg-zinc-800/40">
                          <td className="p-3">
                            <p className="text-zinc-200 font-medium">{o.name}</p>
                            {o.businessName && <p className="text-xxs text-zinc-500">{o.businessName}</p>}
                          </td>
                          <td className="p-3">{o.email}</td>
                          <td className="p-3">
                            <Badge variant={o.ownerStatus === 'approved' ? 'success' : o.ownerStatus === 'pending' ? 'warning' : 'danger'}>
                              {o.ownerStatus}
                            </Badge>
                          </td>
                          <td className="p-3 text-right flex justify-end gap-1.5">
                            {o.ownerStatus === 'pending' && (
                              <>
                                <Button variant="success" size="xs" onClick={() => moderateOwner.mutate({ id: o._id, action: 'approve' })}>Approve</Button>
                                <Button variant="danger" size="xs" onClick={() => moderateOwner.mutate({ id: o._id, action: 'reject', reason: 'Failed verification checks' })}>Reject</Button>
                              </>
                            )}
                            {o.ownerStatus !== 'pending' && (
                              <span className="text-xs text-zinc-500">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-8">No agency owners registered</p>
              )}
            </Card>
          )}

          {activeTab === 'vehicles' && (
            <Card>
              <Card.Header>
                <Card.Title>Approve Vehicle Listings</Card.Title>
              </Card.Header>
              {vehiclesLoading ? (
                <TableSkeleton rows={5} />
              ) : vehiclesData?.length > 0 ? (
                <div className="space-y-4">
                  {vehiclesData.map((v) => {
                    const img = v.images?.find(i => i.isPrimary) || v.images?.[0];
                    return (
                      <div key={v._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                            {img ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>}
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-100">{v.make} {v.model}</h4>
                            <p className="text-xs text-zinc-400">Owner: {v.owner?.name} · Reg No: {v.registrationNumber}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge status={v.status} dot>{v.status}</Badge>
                              <Badge variant={v.listingStatus === 'approved' ? 'success' : v.listingStatus === 'pending' ? 'warning' : 'danger'}>
                                Listing: {v.listingStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {v.listingStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="success" size="xs" onClick={() => moderateListing.mutate({ id: v._id, action: 'approve' })}>Approve Listing</Button>
                            <Button variant="danger" size="xs" onClick={() => moderateListing.mutate({ id: v._id, action: 'reject', reason: 'Incomplete specs' })}>Reject</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-12">No vehicles in the system</p>
              )}
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card>
              <Card.Header>
                <Card.Title>All System Bookings</Card.Title>
              </Card.Header>
              {bookingsLoading ? (
                <TableSkeleton rows={5} />
              ) : bookingsData?.length > 0 ? (
                <div className="space-y-4">
                  {bookingsData.map((b) => (
                    <div key={b._id} className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-500">#{b._id.slice(-6)}</span>
                          <Badge status={b.status} dot>{b.status}</Badge>
                        </div>
                        <h4 className="font-semibold text-zinc-100 mt-1">{b.vehicle?.make} {b.vehicle?.model}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">Renter: {b.customer?.name} · Owner: {b.owner?.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Dates: {format(new Date(b.startDate), 'MMM d')} - {format(new Date(b.endDate), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-base font-bold text-indigo-400">₹{b.totalAmount?.toLocaleString()}</span>
                        <p className="text-xxs text-zinc-500 mt-0.5">{b.paymentStatus} · {b.rentalType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-12">No bookings recorded in the system</p>
              )}
            </Card>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Top Cities */}
              <Card>
                <Card.Header><Card.Title>Top Performing Cities</Card.Title></Card.Header>
                {analyticsLoading ? (
                  <StatCardSkeleton />
                ) : analytics?.topCities?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.topCities}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="_id" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#f4f4f5' }} />
                      <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-8">No analytics data compiled</p>
                )}
              </Card>

              {/* Popular Vehicles */}
              <Card>
                <Card.Header><Card.Title>Popular Vehicles List</Card.Title></Card.Header>
                {analytics?.topVehicles?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topVehicles.map((v) => (
                      <div key={v._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-zinc-200">{v.make} {v.model}</p>
                            <p className="text-xs text-zinc-500">{v.location?.city} · {v.totalRentals} rentals</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-400">₹{v.totalRevenue?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-6">No vehicle bookings logged</p>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
