
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/dashboard/stats');

        setStats(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load dashboard statistics.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <p className="font-medium text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Lead status chart
  const leadChartData = {
    labels: stats.leads.byStatus.map(item => item.status),
    datasets: [
      {
        label: 'Leads',
        data: stats.leads.byStatus.map(item => item.count),
        backgroundColor: [
          '#3B82F6',
          '#F59E0B',
          '#8B5CF6',
          '#10B981',
          '#EF4444'
        ],
        borderWidth: 0
      }
    ]
  };

  // Activity type chart
  const activityChartData = {
    labels: stats.activities.byType.map(item => item.type),
    datasets: [
      {
        label: 'Activities',
        data: stats.activities.byType.map(item => item.count),
        backgroundColor: '#3B82F6',
        borderRadius: 6
      }
    ]
  };

  const cards = [
    {
      title: 'Total Customers',
      value: stats.customers.total,
      subtitle: `${stats.customers.active} Active`,
      color: 'blue',
      link: '/customers'
    },
    {
      title: 'Total Leads',
      value: stats.leads.total,
      subtitle: 'Across all statuses',
      color: 'purple',
      link: '/leads'
    },
    {
      title: 'Active Opportunities',
      value: stats.opportunities.active,
      subtitle: `${stats.opportunities.won} Won`,
      color: 'green',
      link: '/opportunities'
    },
    {
      title: 'Pending Follow-ups',
      value: stats.followUps.pending,
      subtitle: `${stats.followUps.overdue} Overdue`,
      color: 'orange',
      link: '/followups'
    }
  ];

  const colorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    orange: 'border-orange-500'
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your sales and customer activities.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            to={card.link}
            key={card.title}
            className={`rounded-xl border-l-4 ${colorClasses[card.color]} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
          >
            <p className="text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-800">
              {card.value}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {card.subtitle}
            </p>
          </Link>
        ))}
      </div>

      {/* Opportunity and Activity Summary */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Opportunities
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {stats.opportunities.total}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pipeline Value
          </p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(stats.opportunities.pipelineValue)}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed Activities
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {stats.activities.completed}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {stats.activities.pending} Pending
          </p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Lead Status */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Lead Status Distribution
          </h2>

          {stats.leads.byStatus.length > 0 ? (
            <div className="mx-auto max-w-sm">
              <Doughnut
                data={leadChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          ) : (
            <p className="py-16 text-center text-slate-400">
              No lead data available.
            </p>
          )}
        </div>

        {/* Activity Types */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Activities Overview
          </h2>

          {stats.activities.byType.length > 0 ? (
            <Bar
              data={activityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          ) : (
            <p className="py-16 text-center text-slate-400">
              No activity data available.
            </p>
          )}
        </div>

      </div>

      {/* Recent Activities and Upcoming Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Activities */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Activities
            </h2>

            <Link
              to="/activities"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          {stats.activities.recent.length > 0 ? (
            <div className="space-y-4">
              {stats.activities.recent.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {activity.subject}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.type} · {activity.status}
                    </p>
                  </div>

                  <p className="whitespace-nowrap text-xs text-slate-500">
                    {new Date(activity.activityDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-slate-400">
              No recent activities.
            </p>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Upcoming Follow-ups
            </h2>

            <Link
              to="/followups"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          {stats.followUps.upcoming.length > 0 ? (
            <div className="space-y-4">
              {stats.followUps.upcoming.map((followUp) => (
                <div
                  key={followUp._id}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {followUp.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {followUp.assignedTo?.name || 'Unassigned'}
                    </p>
                  </div>

                  <p className="whitespace-nowrap text-xs text-slate-500">
                    {new Date(followUp.followUpDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-slate-400">
              No upcoming follow-ups.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
