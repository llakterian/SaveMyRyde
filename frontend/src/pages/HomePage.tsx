import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface FeaturedListing {
  id: string;
  title: string;
  price_kes: number;
  location: string;
  images: string[];
  created_at: string;
}

interface Stats {
  totalListings: number;
  totalUsers: number;
  totalTransactions: number;
  averagePrice: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>(
    [],
  );
  const [stats] = useState<Stats>({
    totalListings: 1250,
    totalUsers: 5400,
    totalTransactions: 890,
    averagePrice: 1850000,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/listings?limit=6&status=active`,
      );
      setFeaturedListings(response.data.listings || []);
    } catch (error) {
      console.error("Failed to fetch featured listings:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/listings");
    }
  };

  const features = [
    {
      icon: "🔐",
      title: "Secure Payments",
      description:
        "Multiple payment options including cards, mobile money, bank transfers, and crypto",
    },
    {
      icon: "🪙",
      title: "Credits System",
      description:
        "Earn credits on every purchase and use them for future transactions",
    },
    {
      icon: "🎯",
      title: "Smart Matching",
      description:
        "Advanced algorithms to match you with the perfect vehicle or buyer",
    },
    {
      icon: "✅",
      title: "Vehicle Verification",
      description:
        "Professional inspection services to ensure vehicle quality and authenticity",
    },
    {
      icon: "🎁",
      title: "Referral Rewards",
      description:
        "Earn 1000 credits for every friend you refer to our platform",
    },
    {
      icon: "📊",
      title: "Market Insights",
      description:
        "Real-time market data and pricing insights for informed decisions",
    },
  ];

  const testimonials = [
    {
      name: "John Kamau",
      location: "Nairobi",
      text: "Sold my Toyota Camry in just 3 days! The platform is so easy to use and the payment system is very secure.",
      rating: 5,
      avatar: "👨🏿‍💼",
    },
    {
      name: "Mary Wanjiku",
      location: "Mombasa",
      text: "Found my dream car at an amazing price. The verification service gave me peace of mind.",
      rating: 5,
      avatar: "👩🏿‍💼",
    },
    {
      name: "Peter Ochieng",
      location: "Kisumu",
      text: "The referral program is fantastic! I've earned enough credits to cover my next listing fee.",
      rating: 5,
      avatar: "👨🏿‍🎓",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient hero-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-fluid section-padding text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
              Kenya's #1
              <span className="block text-gradient-secondary">
                Vehicle Marketplace
              </span>
            </h1>
            <p
              className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Buy and sell vehicles with confidence. Secure payments, verified
              listings, and trusted by thousands.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Search for your dream car... (e.g., Toyota Camry 2018)"
                  className="form-input flex-1 text-gray-900 text-lg h-14 rounded-l-2xl border-r-0 focus:z-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-secondary h-14 px-8 rounded-r-2xl rounded-l-none border-l-0"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading-spinner" />
                  ) : (
                    <span>🔍 Search</span>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <Link to="/sell" className="btn btn-primary btn-lg">
                <span className="mr-2">💼</span>
                Sell Your Car
              </Link>
              <Link
                to="/listings"
                className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-gray-900"
              >
                <span className="mr-2">🔍</span>
                Browse All Cars
              </Link>
            </div>
          </div>

          {/* Floating Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.totalListings.toLocaleString()}+
              </div>
              <div className="text-sm text-white/80">Active Listings</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-sm text-white/80">Happy Users</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.totalTransactions.toLocaleString()}+
              </div>
              <div className="text-sm text-white/80">Cars Sold</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">
                KES {(stats.averagePrice / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-white/80">Avg Price</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-padding bg-white dark:bg-slate-900">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Featured</span> Vehicles
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Discover hand-picked, verified vehicles from trusted sellers
              across Kenya
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredListings.slice(0, 6).map((listing, index) => (
              <div
                key={listing.id}
                className="card card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden rounded-t-xl h-48">
                  <img
                    src={listing.images[0] || "/api/placeholder/400/250"}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-success">Verified</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    📍 {listing.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-600">
                      KES {listing.price_kes.toLocaleString()}
                    </span>
                    <Link
                      to={`/listings/${listing.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/listings" className="btn btn-outline btn-lg">
              View All Listings
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose{" "}
              <span className="text-gradient-primary">SaveMyRyde</span>?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
              We've revolutionized the car buying and selling experience in
              Kenya with cutting-edge technology and unmatched service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white dark:bg-slate-900">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-gradient-secondary">Works</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">List Your Vehicle</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create a detailed listing with photos and specifications. Choose
                from Basic, Premium, or VIP packages.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Verified</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our professional verification team inspects your vehicle and
                provides a detailed report for buyers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Transaction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with verified buyers and complete transactions safely
                using our secure payment system.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/sell" className="btn btn-primary btn-lg">
              Start Selling Today
              <span className="ml-2">🚀</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-slate-700">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our <span className="text-gradient-primary">Customers</span>{" "}
              Say
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Real stories from real people who found success on SaveMyRyde
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-2xl mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container-fluid text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their dream
            vehicles on SaveMyRyde
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/listings"
              className="btn bg-white text-orange-600 hover:bg-orange-50 btn-lg"
            >
              <span className="mr-2">🔍</span>
              Browse Cars Now
            </Link>
            <Link
              to="/sell"
              className="btn btn-outline border-white text-white hover:bg-white hover:text-orange-600 btn-lg"
            >
              <span className="mr-2">💼</span>
              Sell Your Car
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-slate-900 text-white">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-slate-400 text-lg mb-8">
              Get the latest car deals, market insights, and platform updates
              delivered to your inbox
            </p>

            <form className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email address"
                className="form-input flex-1 bg-slate-800 border-slate-700 text-white rounded-r-none"
              />
              <button type="submit" className="btn btn-primary rounded-l-none">
                Subscribe
              </button>
            </form>

            <p className="text-slate-500 text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
