// src/pages/dashboard/OwnerDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  Car, TrendingUp, Users, Clock, CheckCircle, XCircle,
  Plus, ChevronRight, IndianRupee, BarChart3, Edit, Trash2, ShieldAlert,
  Upload, Sparkles, Settings, Eye, Check, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { userAPI, bookingAPI, vehicleAPI } from '@/services/api';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Sidebar from '@/components/layout/Sidebar';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const sidebarLinks = [
  { to: '/owner', icon: BarChart3, label: 'Dashboard' },
  { to: '/owner?tab=fleet', icon: Car, label: 'My Fleet' },
  { to: '/owner?tab=bookings', icon: Clock, label: 'Bookings' },
  { to: '/owner?tab=add-vehicle', icon: Plus, label: 'Add Vehicle' },
  { to: '/profile', icon: Users, label: 'Profile' },
];

const vehicleTypes = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
];

const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'cng', label: 'CNG' },
];

const transmissions = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const queryClient = useQueryClient();
  const [selectedVehicleFiles, setSelectedVehicleFiles] = useState([]);

  // Forms
  const { register: regAdd, handleSubmit: hAdd, reset: resetAdd } = useForm();
  const { register: regEdit, handleSubmit: hEdit, reset: resetEdit, setValue: setEditVal } = useForm();
  const [editVehicleId, setEditVehicleId] = useState(null);

  // Queries
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: () => userAPI.getOwnerDashboard(),
    select: (d) => d.data.data,
  });

  const { data: ownerBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: () => bookingAPI.getOwnerBookings({ limit: 100 }),
    select: (d) => d.data.data,
    enabled: activeTab === 'bookings' || activeTab === 'overview',
  });

  // Mutations
  const addVehicle = useMutation({
    mutationFn: (data) => vehicleAPI.create(data),
    onSuccess: async (res) => {
      const createdId = res.data.data._id;
      // Upload files if any
      if (selectedVehicleFiles.length > 0) {
        const fd = new FormData();
        selectedVehicleFiles.forEach((file) => fd.append('images', file));
        try {
          await vehicleAPI.uploadImages(createdId, fd);
        } catch {
          toast.error('Vehicle created but image upload failed');
        }
      }
      toast.success('Vehicle listed successfully! Pending Admin Approval.');
      resetAdd();
      setSelectedVehicleFiles([]);
      queryClient.invalidateQueries(['owner-dashboard']);
      setSearchParams({ tab: 'fleet' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to list vehicle'),
  });

  const editVehicle = useMutation({
    mutationFn: ({ id, data }) => vehicleAPI.update(id, data),
    onSuccess: () => {
      toast.success('Vehicle updated successfully');
      setEditVehicleId(null);
      queryClient.invalidateQueries(['owner-dashboard']);
      setSearchParams({ tab: 'fleet' });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id) => vehicleAPI.delete(id),
    onSuccess: () => {
      toast.success('Vehicle removed');
      queryClient.invalidateQueries(['owner-dashboard']);
    },
  });

  const approveBooking = useMutation({
    mutationFn: (id) => bookingAPI.approve(id),
    onSuccess: () => {
      toast.success('Booking approved!');
      queryClient.invalidateQueries(['owner-bookings', 'owner-dashboard']);
    },
  });

  const rejectBooking = useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.reject(id, reason),
    onSuccess: () => {
      toast.success('Booking rejected');
      queryClient.invalidateQueries(['owner-bookings', 'owner-dashboard']);
    },
  });

  const startEdit = (v) => {
    setEditVehicleId(v._id);
    setEditVal('make', v.make);
    setEditVal('model', v.model);
    setEditVal('vehicleType', v.vehicleType);
    setEditVal('fuelType', v.fuelType);
    setEditVal('transmission', v.transmission);
    setEditVal('registrationNumber', v.registrationNumber);
    setEditVal('description', v.description);
    setEditVal('location.city', v.location?.city);
    setEditVal('pricing.daily', v.pricing?.daily);
    setEditVal('pricing.weekly', v.pricing?.weekly);
    setEditVal('pricing.monthly', v.pricing?.monthly);
    setEditVal('pricing.securityDeposit', v.pricing?.securityDeposit);
    setEditVal('status', v.status);
    setSearchParams({ tab: 'edit-vehicle' });
  };

  const fleet = dashData?.vehicles?.list || [];
  const stats = dashData?.vehicles?.stats || {};
  const revenueData = dashData?.revenueData?.map((r) => ({
    month: `${r._id.month}/${r._id.year}`,
    revenue: r.revenue,
    bookings: r.bookings,
  })) || [];

  const pendingBookings = ownerBookings?.filter(b => b.status === 'pending') || [];
  const activeBookings = ownerBookings?.filter(b => b.status === 'active') || [];
  const completedBookings = ownerBookings?.filter(b => b.status === 'completed') || [];

  return (
    <PageLayout>
      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        <Sidebar links={sidebarLinks} title="Owner Panel" />

        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-bold text-3xl text-zinc-100">
                    Owner Dashboard
                  </h1>
                  <p className="text-zinc-400 mt-1">Manage your fleet and track performance</p>
                </div>
                <Button variant="gradient" onClick={() => setSearchParams({ tab: 'add-vehicle' })} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Vehicle
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                  <>
                    <Card><p className="text-xs text-zinc-400">Total Vehicles</p><p className="text-2xl font-bold mt-1 text-zinc-100">{stats.total || 0}</p></Card>
                    <Card><p className="text-xs text-zinc-400">Total Earnings</p><p className="text-2xl font-bold mt-1 text-emerald-400">₹{(dashData?.totalRevenue || 0).toLocaleString()}</p></Card>
                    <Card><p className="text-xs text-zinc-400">Pending Requests</p><p className="text-2xl font-bold mt-1 text-amber-400">{pendingBookings.length}</p></Card>
                    <Card><p className="text-xs text-zinc-400">Active Rentals</p><p className="text-2xl font-bold mt-1 text-indigo-400">{activeBookings.length}</p></Card>
                  </>
                )}
              </div>

              {/* Area chart */}
              <Card>
                <Card.Header><Card.Title>Earnings & Demand History</Card.Title></Card.Header>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#f4f4f5' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} name="Earnings (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-10">No revenue data recorded</p>
                )}
              </Card>

              {/* Pending Approvals quick list */}
              <Card>
                <Card.Header>
                  <Card.Title>Pending Booking Requests</Card.Title>
                  <Link to="/owner?tab=bookings" className="text-xs text-indigo-400">Manage Bookings →</Link>
                </Card.Header>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {pendingBookings.slice(0, 3).map((b) => (
                      <div key={b._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{b.vehicle?.make} {b.vehicle?.model}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Renter: {b.customer?.name} · {format(new Date(b.startDate), 'MMM d')} - {format(new Date(b.endDate), 'MMM d')}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="success" size="xs" onClick={() => approveBooking.mutate(b._id)}>Approve</Button>
                          <Button variant="danger" size="xs" onClick={() => rejectBooking.mutate({ id: b._id, reason: 'Rejected by owner' })}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-6">No booking requests pending</p>
                )}
              </Card>
            </>
          )}

          {activeTab === 'fleet' && (
            <Card>
              <Card.Header>
                <div>
                  <Card.Title>Fleet Management</Card.Title>
                  <p className="text-xs text-zinc-500 mt-1">Add, update, activate/deactivate, or block vehicles for maintenance</p>
                </div>
              </Card.Header>

              {isLoading ? (
                <TableSkeleton rows={4} />
              ) : fleet.length > 0 ? (
                <div className="space-y-4">
                  {fleet.map((v) => {
                    const img = v.images?.find(i => i.isPrimary) || v.images?.[0];
                    return (
                      <div key={v._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                            {img ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>}
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-100">{v.make} {v.model}</h4>
                            <p className="text-xs text-zinc-500 mt-0.5">Reg No: {v.registrationNumber}</p>
                            <p className="text-xs text-indigo-400 mt-0.5">₹{v.pricing?.daily}/day · ₹{v.pricing?.weekly || 'N/A'}/week</p>
                            <div className="flex gap-2 mt-2">
                              <Badge status={v.status} dot>{v.status}</Badge>
                              <Badge variant={v.listingStatus === 'approved' ? 'success' : v.listingStatus === 'pending' ? 'warning' : 'danger'}>
                                {v.listingStatus === 'approved' ? 'Approved' : v.listingStatus === 'pending' ? 'Pending Admin' : 'Rejected'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="secondary" size="xs" leftIcon={<Edit className="w-3.5 h-3.5" />} onClick={() => startEdit(v)}>Edit</Button>
                          <Button variant="ghost" size="xs" className="text-red-400 hover:text-red-300" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => { if(confirm('Delete listing?')) deleteVehicle.mutate(v._id); }}>Delete</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Car className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No vehicles listed in your fleet yet</p>
                  <Button size="sm" className="mt-4" onClick={() => setSearchParams({ tab: 'add-vehicle' })}>List a Vehicle</Button>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card>
              <Card.Header>
                <Card.Title>Bookings & Rentals</Card.Title>
              </Card.Header>

              {bookingsLoading ? (
                <TableSkeleton rows={4} />
              ) : ownerBookings?.length > 0 ? (
                <div className="space-y-4">
                  {ownerBookings.map((b) => (
                    <div key={b._id} className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">#{b._id.slice(-6)}</span>
                        <h4 className="font-semibold text-zinc-100 mt-1">{b.vehicle?.make} {b.vehicle?.model}</h4>
                        <p className="text-xs text-zinc-400 mt-1">Customer: {b.customer?.name} · {b.customer?.phone}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Dates: {format(new Date(b.startDate), 'MMM d, yyyy')} → {format(new Date(b.endDate), 'MMM d, yyyy')}</p>
                      </div>

                      <div className="flex flex-col items-start sm:items-end justify-between gap-2">
                        <div className="text-left sm:text-right">
                          <Badge status={b.status} dot>{b.status}</Badge>
                          <p className="text-base font-bold text-emerald-400 mt-1">₹{b.totalAmount?.toLocaleString()}</p>
                        </div>

                        {b.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button variant="success" size="xs" onClick={() => approveBooking.mutate(b._id)}>Approve</Button>
                            <Button variant="danger" size="xs" onClick={() => rejectBooking.mutate({ id: b._id, reason: 'Declined' })}>Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-12">No bookings recorded</p>
              )}
            </Card>
          )}

          {activeTab === 'add-vehicle' && (
            <Card>
              <Card.Header>
                <Card.Title>Add Vehicle to Fleet</Card.Title>
              </Card.Header>
              <form onSubmit={hAdd((d) => addVehicle.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Brand / Make" placeholder="e.g. BMW" required {...regAdd('make', { required: true })} />
                  <Input label="Model Name" placeholder="e.g. M340i" required {...regAdd('model', { required: true })} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Select label="Type" options={vehicleTypes} placeholder={null} {...regAdd('vehicleType')} />
                  <Select label="Fuel" options={fuelTypes} placeholder={null} {...regAdd('fuelType')} />
                  <Select label="Transmission" options={transmissions} placeholder={null} {...regAdd('transmission')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Registration Vehicle Number" placeholder="e.g. MH12AB1234" required {...regAdd('registrationNumber', { required: true })} />
                  <Input label="Location (City)" placeholder="e.g. Pune" required {...regAdd('location.city', { required: true })} />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Input label="Daily Price (₹)" type="number" required {...regAdd('pricing.daily', { required: true, valueAsNumber: true })} />
                  <Input label="Weekly Price (₹)" type="number" {...regAdd('pricing.weekly', { valueAsNumber: true })} />
                  <Input label="Monthly Price (₹)" type="number" {...regAdd('pricing.monthly', { valueAsNumber: true })} />
                  <Input label="Security Deposit (₹)" type="number" {...regAdd('pricing.securityDeposit', { valueAsNumber: true })} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input label="Seats" type="number" defaultValue="5" {...regAdd('specifications.seats', { valueAsNumber: true })} />
                  <Input label="Doors" type="number" defaultValue="4" {...regAdd('specifications.doors', { valueAsNumber: true })} />
                  <Input label="Year" type="number" defaultValue={new Date().getFullYear()} {...regAdd('specifications.year', { valueAsNumber: true })} />
                </div>

                <Input label="Specs Features (comma-separated)" placeholder="GPS, AC, Sunroof, Leather Seats" {...regAdd('featuresRaw')} />

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                  <textarea
                    placeholder="Provide details about condition, pickup, etc."
                    {...regAdd('description')}
                    className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 h-24 resize-none"
                  />
                </div>

                {/* Upload Photos Section */}
                <div className="p-4 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/20 text-center">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-300">Select Vehicle Images</p>
                  <p className="text-xs text-zinc-500 mt-1">Upload files from your computer</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="mt-3 text-sm text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    onChange={(e) => setSelectedVehicleFiles(Array.from(e.target.files))}
                  />
                  {selectedVehicleFiles.length > 0 && (
                    <p className="text-xs text-indigo-400 mt-2">{selectedVehicleFiles.length} file(s) selected</p>
                  )}
                </div>

                <Button type="submit" loading={addVehicle.isLoading} fullWidth size="lg" variant="gradient">Create Listing</Button>
              </form>
            </Card>
          )}

          {activeTab === 'edit-vehicle' && editVehicleId && (
            <Card>
              <Card.Header>
                <Card.Title>Edit Vehicle Details</Card.Title>
              </Card.Header>
              <form onSubmit={hEdit((data) => editVehicle.mutate({ id: editVehicleId, data }))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Brand / Make" required {...regEdit('make')} />
                  <Input label="Model" required {...regEdit('model')} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select label="Type" options={vehicleTypes} placeholder={null} {...regEdit('vehicleType')} />
                  <Select label="Fuel" options={fuelTypes} placeholder={null} {...regEdit('fuelType')} />
                  <Select label="Transmission" options={transmissions} placeholder={null} {...regEdit('transmission')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Registration Number" required {...regEdit('registrationNumber')} />
                  <Input label="Location (City)" required {...regEdit('location.city')} />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Input label="Daily Price" type="number" required {...regEdit('pricing.daily', { valueAsNumber: true })} />
                  <Input label="Weekly Price" type="number" {...regEdit('pricing.weekly', { valueAsNumber: true })} />
                  <Input label="Monthly Price" type="number" {...regEdit('pricing.monthly', { valueAsNumber: true })} />
                  <Input label="Security Deposit" type="number" {...regEdit('pricing.securityDeposit', { valueAsNumber: true })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Availability Status" options={[
                    { value: 'available', label: 'Available' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'inactive', label: 'Inactive' }
                  ]} placeholder={null} {...regEdit('status')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                  <textarea {...regEdit('description')} className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2.5 text-sm outline-none h-24" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setSearchParams({ tab: 'fleet' })}>Cancel</Button>
                  <Button type="submit" loading={editVehicle.isLoading} variant="primary">Save Changes</Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default OwnerDashboard;
