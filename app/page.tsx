// app/page.tsx — Public landing page
import Link from 'next/link';
import { Camera, Smartphone, Car, Star, Shield, Clock } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const categories = [
  { label: 'Cameras', icon: Camera, href: '/guest/browse?category=camera', desc: 'Mirrorless & Digital' },
  { label: 'Smartphones', icon: Smartphone, href: '/guest/browse?category=smartphone', desc: 'Latest Models' },
  { label: 'Vehicles', icon: Car, href: '/guest/browse?category=vehicle', desc: 'Cars & More' },
];

const features = [
  { icon: Shield, title: 'Verified Renters', desc: 'KYC document verification protects every rental.' },
  { icon: Clock, title: 'Real-Time Availability', desc: 'No double bookings — check availability instantly.' },
  { icon: Star, title: 'Trusted Reviews', desc: 'Authentic ratings from verified renters.' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-brand-500 text-white py-20 px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Rent What You Need, When You Need It</h1>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Browse cameras, smartphones, and vehicles from RentSpotPH — book in minutes, pick up on your schedule.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/guest/browse" className="bg-white text-brand-600 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition">
              Browse Rentals
            </Link>
            <Link href="/auth/register" className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-600 transition">
              Get Started
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map(({ label, icon: Icon, href, desc }) => (
              <Link key={label} href={href}
                className="card flex flex-col items-center text-center hover:border-brand-400 hover:shadow-md transition group">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition">
                  <Icon className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="font-semibold text-lg">{label}</h3>
                <p className="text-sm text-neutral-500 mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-neutral-100 py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Why Choose RentSpot.ph?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card text-center">
                  <Icon className="w-8 h-8 text-brand-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-neutral-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Rent?</h2>
          <p className="text-neutral-500 mb-6">Create a free account and book your first rental today.</p>
          <Link href="/auth/register" className="btn-primary">
            Create Account
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}