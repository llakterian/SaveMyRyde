import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface DashboardStats {
  activeListings: number;
  pendingListings: number;
  totalUsers: number;
  totalSales: number;
  revenueKES: number;
  pendingPayments: number;
  verificationRequests: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    pendingListings: 0,
    totalUsers: 0,
    totalSales: 0,
    revenueKES: 0,
    pendingPayments: 0,
    verificationRequests: 0,
  });

  const [revenueChart, setRevenueChart] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Revenue (KES)",
        data: [],
        backgroundColor: "rgba(240, 115, 10, 0.2)",
        borderColor: "#f0730a",
        borderWidth: 2,
      },
    ],
  });

  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setStats({
            activeListings: 127,
            pendingListings: 23,
            totalUsers: 546,
            totalSales: 95,
            revenueKES: 745000,
            pendingPayments: 17,
            verificationRequests: 8,
          });

          setRevenueChart({
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Revenue (KES)",
                data: [125000, 165000, 105000, 135000, 90000, 125000],
                backgroundColor: "rgba(240, 115, 10, 0.2)",
                borderColor: "#f0730a",
                borderWidth: 2,
              },
            ],
          });

          setRecentListings([
            {
              id: "a1b2c3",
              title: "2019 Toyota RAV4 - Excellent Condition",
              price_kes: 2850000,
              status: "pending_payment",
              created_at: "2024-06-12T09:14:23Z",
              user_id: "user123",
            },
            {
              id: "d4e5f6",
              title: "2017 Mercedes Benz C200 - Low Mileage",
              price_kes: 3200000,
              status: "active",
              created_at: "2024-06-11T15:23:45Z",
              user_id: "user456",
            },
          ]);

          setRecentPayments([
            {
              id: "p1q2r3",
              user_id: "user123",
              listing_id: "a1b2c3",
              amount_kes: 5000,
              status: "pending",
              provider: "mobile_money",
              created_at: "2024-06-12T09:20:15Z",
            },
          ]);

          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [baseUrl]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'pending_payment':
        return <span className="badge badge-warning">Pending Payment</span>;
      case 'sold':
        return <span className="badge badge-info">Sold</span>;
      case 'successful':
        return <span className="badge badge-success">Successful</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'initiated':
        return <span className="badge badge-info">Initiated</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container-fluid py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold heading-gradient mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome to SaveMyRyde Admin Control Panel
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner w-8 h-8 border-4"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card p-5 border-l-4 border-orange-500">
                <div className="text-sm text-slate-500 dark:text-slate-400">Active Listings</div>
                <div className="text-2xl font-bold">{stats.activeListings}</div>
                <div className="flex justify-between mt-2">
                  <Link to="/admin/listings?status=active" className="text-xs text-orange-500 hover:text-orange-600">View all</Link>
                  <span className="text-xs text-green-500">↑ 12%</span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-yellow-500">
                <div className="text-sm text-slate-500 dark:text-slate-400">Pending Approvals</div>
                <div className="text-2xl font-bold">{stats.pendingListings}</div>
                <div className="flex justify-between mt-2">
                  <Link to="/admin/listings?status=pending" className="text-xs text-orange-500 hover:text-orange-600">View all</Link>
                  <span className="text-xs text-yellow-500">↑ 5%</span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-teal-500">
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Users</div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="flex justify-between mt-2">
                  <Link to="/admin/users" className="text-xs text-orange-500 hover:text-orange-600">View all</Link>
                  <span className="text-xs text-green-500">↑ 8%</span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-purple-500">
                <div className="text-sm text-slate-500 dark:text-slate-400">Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenueKES)}</div>
                <div className="flex justify-between mt-2">
                  <Link to="/admin/payments" className="text-xs text-orange-500 hover:text-orange-600">View all</Link>
                  <span className="text-xs text-green-500">↑ 15%</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 6 Months)</h3>
                <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex h-48 items-end space-x-2">
                    {revenueChart.labels.map((label, index) => (
                      <div key={label} className="flex flex-col items-center">
                        <div
                          className="w-10 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-md"
                          style={{
                            height: `${(revenueChart.datasets[0].data[index] / Math.max(...revenueChart.datasets[0].data)) * 180}px`
                          }}
                        ></div>
                        <div className="text-xs mt-2">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Listings Summary</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">{stats.activeListings + stats.pendingListings}</div>
                    <div className="text-lg text-slate-600 dark:text-slate-400">Total Listings</div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active</span>
                        <span className="text-sm font-medium">{stats.activeListings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium">{stats.pendingListings}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Listings</h3>
                  <Link to="/admin/listings" className="text-orange-500 hover:text-orange-600 text-sm">View all</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                      {recentListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/admin/listings/${listing.id}`} className="text-slate-900 dark:text-slate-100 hover:text-orange-500">
                              {listing.title.length > 30 ? listing.title.substring(0, 30) + '...' : listing.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {formatCurrency(listing.price_kes)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(listing.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Payments</h3>
                  <Link to="/admin/payments" className="text-orange-500 hover:text-orange-600 text-sm">View all</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          User ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                      {recentPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link to={`/admin/users/${payment.user_id}`} className="text-slate-900 dark:text-slate-100 hover:text-orange-500">
                              {payment.user_id}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {formatCurrency(payment.amount_kes)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/admin/listings/create" className="card p-4 text-center hover:border-orange-300 transition-all">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <h4 className="font-medium">Add Listing</h4>
                </Link>

                <Link to="/admin/users/create" className="card p-4 text-center hover:border-orange-300 transition-all">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h4 className="font-medium">Add User</h4>
                </Link>

                <Link to="/admin/payments/pending" className="card p-4 text-center hover:border-orange-300 transition-all">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="font-medium">Verify Payments</h4>
                </Link>

                <Link to="/admin/settings" className="card p-4 text-center hover:border-orange-300 transition-all">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h4 className="font-medium">Settings</h4>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
