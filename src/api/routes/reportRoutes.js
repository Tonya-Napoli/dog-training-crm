// src/api/routes/reportRoutes.js
import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import ClientPackage from '../models/ClientPackage.js';
import Package from '../models/Package.js';
import Invoice from '../models/Invoice.js';
import auth, { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// ======================
// CONSTANTS AND UTILITIES
// ======================

const REPORT_TYPES = {
  CLIENT_GROWTH: 'client-growth',
  TRAINER_PERFORMANCE: 'trainer-performance', 
  REVENUE_ANALYSIS: 'revenue-analysis',
  SESSION_METRICS: 'session-metrics',
  PACKAGE_ANALYTICS: 'package-analytics'
};

const TIME_PERIODS = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_6_MONTHS: 180,
  LAST_YEAR: 365
};

// Clean Code: Single Responsibility - Date utility functions
class DateUtils {
  static getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return { startDate, endDate };
  }

  static getMonthlyPeriods(months = 12) {
    const periods = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      periods.push({
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        start,
        end,
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
    }
    return periods;
  }

  static getWeeklyPeriods(weeks = 12) {
    const periods = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      
      periods.push({
        label: `Week of ${startDate.toLocaleDateString()}`,
        start: startDate,
        end: endDate
      });
    }
    return periods;
  }
}

// Clean Code: Separation of Concerns - Report generation classes
class ClientGrowthReportGenerator {
  async generateReport(filters = {}) {
    const { period = TIME_PERIODS.LAST_90_DAYS, groupBy = 'month' } = filters;
    
    try {
      const { startDate, endDate } = DateUtils.getDateRange(period);
      const periods = groupBy === 'week' 
        ? DateUtils.getWeeklyPeriods(Math.ceil(period / 7))
        : DateUtils.getMonthlyPeriods(Math.ceil(period / 30));

      const clientGrowthData = await this.getClientRegistrationData(periods);
      const trainerGrowthData = await this.getTrainerGrowthData(periods);
      const geographicData = await this.getGeographicDistribution(startDate, endDate);
      const summaryStats = await this.getSummaryStatistics(startDate, endDate);

      return {
        reportType: REPORT_TYPES.CLIENT_GROWTH,
        generatedAt: new Date(),
        period: { startDate, endDate, days: period },
        clientGrowth: clientGrowthData,
        trainerGrowth: trainerGrowthData,
        geographic: geographicData,
        summary: summaryStats
      };
    } catch (error) {
      throw new Error(`Failed to generate client growth report: ${error.message}`);
    }
  }

  async getClientRegistrationData(periods) {
    const data = [];
    
    for (const period of periods) {
      const newClients = await User.countDocuments({
        role: 'client',
        createdAt: {
          $gte: period.start,
          $lte: period.end
        }
      });

      const activeClients = await User.countDocuments({
        role: 'client',
        isActive: true,
        createdAt: { $lte: period.end }
      });

      data.push({
        period: period.label,
        newClients,
        activeClients,
        date: period.end
      });
    }

    return data;
  }

  async getTrainerGrowthData(periods) {
    const data = [];
    
    for (const period of periods) {
      const newTrainers = await User.countDocuments({
        role: 'trainer',
        createdAt: {
          $gte: period.start,
          $lte: period.end
        }
      });

      const activeTrainers = await User.countDocuments({
        role: 'trainer',
        isActive: true,
        createdAt: { $lte: period.end }
      });

      data.push({
        period: period.label,
        newTrainers,
        activeTrainers,
        date: period.end
      });
    }

    return data;
  }

  async getGeographicDistribution(startDate, endDate) {
    const geographic = await User.aggregate([
      {
        $match: {
          role: 'client',
          createdAt: { $gte: startDate, $lte: endDate },
          'address.state': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$address.state',
          clientCount: { $sum: 1 },
          cities: { $addToSet: '$address.city' }
        }
      },
      {
        $project: {
          state: '$_id',
          clientCount: 1,
          cityCount: { $size: '$cities' },
          _id: 0
        }
      },
      { $sort: { clientCount: -1 } }
    ]);

    return geographic;
  }

  async getSummaryStatistics(startDate, endDate) {
    const [
      totalClients,
      newClients,
      activeClients,
      totalTrainers,
      activeTrainers,
      completedSessions
    ] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ 
        role: 'client', 
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      User.countDocuments({ role: 'client', isActive: true }),
      User.countDocuments({ role: 'trainer' }),
      User.countDocuments({ role: 'trainer', isActive: true }),
      Session.countDocuments({ 
        status: 'completed',
        sessionDate: { $gte: startDate, $lte: endDate }
      })
    ]);

    return {
      totalClients,
      newClients,
      activeClients,
      totalTrainers,
      activeTrainers,
      completedSessions,
      clientRetentionRate: totalClients > 0 ? (activeClients / totalClients * 100).toFixed(2) : 0
    };
  }
}

class SessionMetricsReportGenerator {
  async generateReport(filters = {}) {
    const { period = TIME_PERIODS.LAST_30_DAYS } = filters;
    const { startDate, endDate } = DateUtils.getDateRange(period);
    
    try {
      const sessionStats = await this.getSessionStatistics(startDate, endDate);
      const trainerPerformance = await this.getTrainerSessionMetrics(startDate, endDate);
      const clientEngagement = await this.getClientEngagementMetrics(startDate, endDate);

      return {
        reportType: REPORT_TYPES.SESSION_METRICS,
        generatedAt: new Date(),
        period: { startDate, endDate, days: period },
        sessionStats,
        trainerPerformance,
        clientEngagement
      };
    } catch (error) {
      throw new Error(`Failed to generate session metrics report: ${error.message}`);
    }
  }

  async getSessionStatistics(startDate, endDate) {
    const sessionStats = await Session.aggregate([
      {
        $match: {
          sessionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgressRating: { $avg: '$progressRating' }
        }
      }
    ]);

    const totalSessions = sessionStats.reduce((sum, stat) => sum + stat.count, 0);
    const completionRate = totalSessions > 0 
      ? ((sessionStats.find(s => s._id === 'completed')?.count || 0) / totalSessions * 100).toFixed(2)
      : 0;

    return {
      total: totalSessions,
      byStatus: sessionStats,
      completionRate: parseFloat(completionRate)
    };
  }

  async getTrainerSessionMetrics(startDate, endDate) {
    return await Session.aggregate([
      {
        $match: {
          sessionDate: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'trainer',
          foreignField: '_id',
          as: 'trainerInfo'
        }
      },
      {
        $unwind: '$trainerInfo'
      },
      {
        $group: {
          _id: '$trainer',
          trainerName: { $first: '$trainerInfo.firstName' },
          trainerLastName: { $first: '$trainerInfo.lastName' },
          sessionCount: { $sum: 1 },
          avgProgressRating: { $avg: '$progressRating' },
          totalDuration: { $sum: '$duration' }
        }
      },
      {
        $project: {
          trainerId: '$_id',
          trainerName: { $concat: ['$trainerName', ' ', '$trainerLastName'] },
          sessionCount: 1,
          avgProgressRating: { $round: ['$avgProgressRating', 2] },
          totalHours: { $round: [{ $divide: ['$totalDuration', 60] }, 1] },
          _id: 0
        }
      },
      { $sort: { sessionCount: -1 } }
    ]);
  }

  async getClientEngagementMetrics(startDate, endDate) {
    return await Session.aggregate([
      {
        $match: {
          sessionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $unwind: '$clientInfo'
      },
      {
        $group: {
          _id: '$client',
          clientName: { $first: { $concat: ['$clientInfo.firstName', ' ', '$clientInfo.lastName'] } },
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
          },
          avgProgressRating: { $avg: '$progressRating' }
        }
      },
      {
        $project: {
          clientId: '$_id',
          clientName: 1,
          totalSessions: 1,
          completedSessions: 1,
          cancelledSessions: 1,
          noShowSessions: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalSessions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] }, 2] },
              0
            ]
          },
          avgProgressRating: { $round: ['$avgProgressRating', 2] },
          _id: 0
        }
      },
      { $sort: { totalSessions: -1 } },
      { $limit: 50 }
    ]);
  }
}

class RevenueAnalysisReportGenerator {
  async generateReport(filters = {}) {
    const { period = TIME_PERIODS.LAST_90_DAYS } = filters;
    const { startDate, endDate } = DateUtils.getDateRange(period);
    
    try {
      const revenueStats = await this.getRevenueStatistics(startDate, endDate);
      const packageRevenue = await this.getPackageRevenueBreakdown(startDate, endDate);
      const monthlyTrends = await this.getMonthlyRevenueTrends(startDate, endDate);

      return {
        reportType: REPORT_TYPES.REVENUE_ANALYSIS,
        generatedAt: new Date(),
        period: { startDate, endDate, days: period },
        revenueStats,
        packageRevenue,
        monthlyTrends
      };
    } catch (error) {
      throw new Error(`Failed to generate revenue analysis report: ${error.message}`);
    }
  }

  async getRevenueStatistics(startDate, endDate) {
    const [totalRevenue, paidInvoices, pendingRevenue, packagesSold] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            status: 'paid',
            paidDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).then(result => result[0]?.total || 0),
      
      Invoice.countDocuments({
        status: 'paid',
        paidDate: { $gte: startDate, $lte: endDate }
      }),
      
      Invoice.aggregate([
        {
          $match: {
            status: 'pending',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).then(result => result[0]?.total || 0),
      
      ClientPackage.countDocuments({
        purchaseDate: { $gte: startDate, $lte: endDate }
      })
    ]);

    return {
      totalRevenue,
      paidInvoices,
      pendingRevenue,
      packagesSold,
      averageInvoiceValue: paidInvoices > 0 ? (totalRevenue / paidInvoices).toFixed(2) : 0
    };
  }

  async getPackageRevenueBreakdown(startDate, endDate) {
    return await ClientPackage.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'packageInfo'
        }
      },
      {
        $unwind: '$packageInfo'
      },
      {
        $group: {
          _id: '$package',
          packageName: { $first: '$packageInfo.name' },
          packagePrice: { $first: '$packageInfo.price' },
          unitsSold: { $sum: 1 },
          totalRevenue: { $sum: '$packageInfo.price' }
        }
      },
      {
        $project: {
          packageId: '$_id',
          packageName: 1,
          packagePrice: 1,
          unitsSold: 1,
          totalRevenue: 1,
          _id: 0
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
  }

  async getMonthlyRevenueTrends(startDate, endDate) {
    const periods = DateUtils.getMonthlyPeriods(6);
    const trends = [];

    for (const period of periods) {
      const monthlyRevenue = await Invoice.aggregate([
        {
          $match: {
            status: 'paid',
            paidDate: { $gte: period.start, $lte: period.end }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            invoiceCount: { $sum: 1 }
          }
        }
      ]);

      trends.push({
        period: period.label,
        month: period.month,
        year: period.year,
        revenue: monthlyRevenue[0]?.totalRevenue || 0,
        invoiceCount: monthlyRevenue[0]?.invoiceCount || 0
      });
    }

    return trends;
  }
}

// ======================
// ROUTE HANDLERS
// ======================

// @route   GET /api/reports/client-growth
// @desc    Generate client growth report
// @access  Admin only
router.get('/client-growth', auth, adminAuth, async (req, res) => {
  try {
    const { period, groupBy } = req.query;
    const filters = {
      period: period ? parseInt(period) : TIME_PERIODS.LAST_90_DAYS,
      groupBy: groupBy || 'month'
    };

    const generator = new ClientGrowthReportGenerator();
    const report = await generator.generateReport(filters);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Client Growth Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate client growth report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/reports/session-metrics
// @desc    Generate session metrics report
// @access  Admin only
router.get('/session-metrics', auth, adminAuth, async (req, res) => {
  try {
    const { period } = req.query;
    const filters = {
      period: period ? parseInt(period) : TIME_PERIODS.LAST_30_DAYS
    };

    const generator = new SessionMetricsReportGenerator();
    const report = await generator.generateReport(filters);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Session Metrics Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate session metrics report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/reports/revenue-analysis
// @desc    Generate revenue analysis report
// @access  Admin only
router.get('/revenue-analysis', auth, adminAuth, async (req, res) => {
  try {
    const { period } = req.query;
    const filters = {
      period: period ? parseInt(period) : TIME_PERIODS.LAST_90_DAYS
    };

    const generator = new RevenueAnalysisReportGenerator();
    const report = await generator.generateReport(filters);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Revenue Analysis Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue analysis report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/reports/available
// @desc    Get available reports metadata
// @access  Admin only
router.get('/available', auth, adminAuth, async (req, res) => {
  try {
    const availableReports = [
      {
        type: REPORT_TYPES.CLIENT_GROWTH,
        name: 'Client Growth Report',
        description: 'Track client acquisition and trainer growth over time',
        endpoint: '/api/reports/client-growth',
        parameters: ['period', 'groupBy'],
        status: 'available'
      },
      {
        type: REPORT_TYPES.SESSION_METRICS,
        name: 'Session Metrics Report',
        description: 'Analyze training session completion rates and performance',
        endpoint: '/api/reports/session-metrics',
        parameters: ['period'],
        status: 'available'
      },
      {
        type: REPORT_TYPES.REVENUE_ANALYSIS,
        name: 'Revenue Analysis Report',
        description: 'Financial performance and revenue trends analysis',
        endpoint: '/api/reports/revenue-analysis',
        parameters: ['period'],
        status: 'available'
      }
    ];

    res.json({
      success: true,
      reports: availableReports,
      timePeriods: {
        LAST_7_DAYS: TIME_PERIODS.LAST_7_DAYS,
        LAST_30_DAYS: TIME_PERIODS.LAST_30_DAYS,
        LAST_90_DAYS: TIME_PERIODS.LAST_90_DAYS,
        LAST_6_MONTHS: TIME_PERIODS.LAST_6_MONTHS,
        LAST_YEAR: TIME_PERIODS.LAST_YEAR
      }
    });
  } catch (error) {
    console.error('Available Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available reports'
    });
  }
});

export default router;