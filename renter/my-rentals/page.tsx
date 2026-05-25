// app/renter/my-rentals/page.tsx
import { createClient } from '@/lib/supabase_server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import BookingCard from '@/components/booking/BookingCard';
import { format } from 'date-fns';

export default async function MyRentalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: bookings } = await supabase
    .from('tbl_bookings')
    .select('*, tbl_units(unit_name, category, image_url, daily_rate), tbl_payment(*), tbl_kyc(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const active = (bookings ?? []).filter(b => !['completed', 'cancelled', 'rejected'].includes(b.status));
  const history = (bookings ?? []).filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">My Rentals</h1>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Active Bookings ({active.length})</h2>
          {active.length === 0 ? (
            <p className="text-neutral-400 text-sm py-8 text-center border border-dashed rounded-xl">
              No active bookings. <a href="/guest/browse" className="text-brand-500 hover:underline">Browse rentals</a>
            </p>
          ) : (
            <div className="space-y-4">
              {active.map(b => <BookingCard key={b.booking_id} booking={b} />)}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Booking History ({history.length})</h2>
          {history.length === 0 ? (
            <p className="text-neutral-400 text-sm">No completed bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map(b => <BookingCard key={b.booking_id} booking={b} />)}
            </div>
          )}
        </section>
      </main>
    </>
  );
}