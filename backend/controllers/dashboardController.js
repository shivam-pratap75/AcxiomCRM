
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');

const getDashboardStats = async (req, res) => {
  try {
    // Sales Executives see only their assigned records.
    // Admins and Managers currently see all records.
    const filter =
      req.user.role === 'Sales Executive'
        ? { assignedTo: req.user._id }
        : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeOpportunityFilter = {
      ...filter,
      stage: { $nin: ['Won', 'Lost'] }
    };

    const plannedFollowUpFilter = {
      ...filter,
      status: 'Planned'
    };

    const [
      totalCustomers,
      activeCustomers,
      totalLeads,
      leadsByStatus,
      totalOpportunities,
      activeOpportunities,
      pipelineValue,
      wonOpportunities,
      pendingFollowUps,
      overdueFollowUps,
      completedActivities,
      pendingActivities,
      activitiesByType,
      recentActivities,
      upcomingFollowUps
    ] = await Promise.all([

      // Customers
      Customer.countDocuments(filter),

      Customer.countDocuments({
        ...filter,
        status: 'Active'
      }),

      // Leads
      Lead.countDocuments(filter),

      Lead.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Opportunities
      Opportunity.countDocuments(filter),

      Opportunity.countDocuments(activeOpportunityFilter),

      Opportunity.aggregate([
        { $match: activeOpportunityFilter },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),

      Opportunity.countDocuments({
        ...filter,
        stage: 'Won'
      }),

      // Follow-ups
      FollowUp.countDocuments(plannedFollowUpFilter),

      FollowUp.countDocuments({
        ...plannedFollowUpFilter,
        followUpDate: { $lt: today }
      }),

      // Activities
      Activity.countDocuments({
        ...filter,
        status: 'Completed'
      }),

      Activity.countDocuments({
        ...filter,
        status: 'Planned'
      }),

      Activity.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]),

      Activity.find(filter)
        .sort({ activityDate: -1 })
        .limit(5)
        .populate('assignedTo', 'name')
        .lean(),

      FollowUp.find({
        ...plannedFollowUpFilter,
        followUpDate: { $gte: today }
      })
        .sort({ followUpDate: 1 })
        .limit(5)
        .populate('assignedTo', 'name')
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
          active: activeCustomers
        },

        leads: {
          total: totalLeads,
          byStatus: leadsByStatus.map(item => ({
            status: item._id,
            count: item.count
          }))
        },

        opportunities: {
          total: totalOpportunities,
          active: activeOpportunities,
          won: wonOpportunities,
          pipelineValue: pipelineValue[0]?.total || 0
        },

        followUps: {
          pending: pendingFollowUps,
          overdue: overdueFollowUps,
          upcoming: upcomingFollowUps
        },

        activities: {
          completed: completedActivities,
          pending: pendingActivities,
          byType: activitiesByType.map(item => ({
            type: item._id,
            count: item.count
          })),
          recent: recentActivities
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = { getDashboardStats };
