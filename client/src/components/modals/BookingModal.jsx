// src/components/modals/BookingModal.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee, Tag, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { bookingAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';

const BookingModal = ({ isOpen, onClose, vehicle, bookedDates = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Build excluded date ranges
  const excludedRanges = bookedDates
    .filter((b) => ['approved', 'active', 'pending'].includes(b.status))
    .map((b) => ({ start: new Date(b.startDate), end: new Date(b.endDate) }));

  const isDateExcluded = (date) =>
    excludedRanges.some((r) => isWithinInterval(date, r));

  const totalDays = startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate)) : 0;

  const calculatePrice = () => {
    if (!totalDays) return null;
    const { daily, weekly, monthly } = vehicle.pricing || {};
    let base = 0;
    if (totalDays >= 28 && monthly) base = monthly * Math.ceil(totalDays / 28);
    else if (totalDays >= 7 && weekly) base = weekly * Math.ceil(totalDays / 7);
    else base = (daily || 0) * totalDays;
    const tax = Math.round(base * 0.18);
    const deposit = vehicle.pricing?.securityDeposit || 0;
    return { base, tax, deposit, total: base + tax + deposit };
  };

  const pricing = calculatePrice();

  const { mutate: createBooking, isLoading } = useMutation({
    mutationFn: (data) => bookingAPI.create(data),
    onSuccess: (res) => {
      toast.success('Booking created! Awaiting owner approval.');
      queryClient.invalidateQueries(['my-bookings']);
      onClose();
      navigate('/dashboard?tab=bookings');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking failed');
    },
  });

  const handleSubmit = () => {
    if (!startDate || !endDate) return toast.error('Please select dates');
    createBooking({
      vehicleId: vehicle._id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes,
      promoCode: promoCode.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${vehicle?.make} ${vehicle?.model}`} size="md">
      <div className="space-y-5">
        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(d) => { setStartDate(d); if (endDate && d >= endDate) setEndDate(null); }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              excludeDates={excludedRanges.flatMap((r) => {
                const dates = [];
                let d = new Date(r.start);
                while (d <= r.end) { dates.push(new Date(d)); d.setDate(d.getDate() + 1); }
                return dates;
              })}
              placeholderText="Select start date"
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()}
              placeholderText="Select end date"
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Duration summary */}
        {totalDays > 0 && (
          <div className="flex items-center gap-2 text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2.5">
            <Calendar className="w-4 h-4" />
            <span>{totalDays} day{totalDays > 1 ? 's' : ''} rental</span>
          </div>
        )}

        {/* Promo code */}
        <Input
          label="Promo Code (optional)"
          placeholder="Enter promo code"
          leftIcon={<Tag className="w-4 h-4" />}
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notes (optional)</label>
          <textarea
            placeholder="Any special requirements or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 resize-none h-20"
          />
        </div>

        {/* Price breakdown */}
        {pricing && (
          <div className="glass rounded-xl border border-zinc-700 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Price Breakdown</h4>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Base rental</span>
              <span>₹{pricing.base.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>GST (18%)</span>
              <span>₹{pricing.tax.toLocaleString()}</span>
            </div>
            {pricing.deposit > 0 && (
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Security deposit</span>
                <span>₹{pricing.deposit.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold text-zinc-100">
              <span>Total</span>
              <span className="text-indigo-400">₹{pricing.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-zinc-500">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Booking requires owner approval. You'll be notified once approved.</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
        <Button
          variant="gradient"
          fullWidth
          loading={isLoading}
          disabled={!startDate || !endDate || !totalDays}
          onClick={handleSubmit}
          leftIcon={<IndianRupee className="w-4 h-4" />}
        >
          Confirm Booking
        </Button>
      </div>
    </Modal>
  );
};

export default BookingModal;
