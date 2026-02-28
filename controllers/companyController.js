const Bug = require("../models/Bug");
const User = require("../models/User");

exports.getCompanyAnalytics = async (req, res) => {
  try {
    const companyId = req.user.id;

    const bugs = await Bug.find({ company: companyId });

    const approved = bugs.filter(b => b.status === "approved");
    const rejected = bugs.filter(b => b.status === "rejected");
    const submitted = bugs.filter(b => b.status === "submitted");

    const totalPaid = approved.reduce(
      (sum, b) => sum + (Number(b.reward) || 0),
      0
    );

    const company = await User.findById(companyId);

    /* =============================
       MONTHLY TREND CALCULATION
    ============================== */

    const monthlyMap = {};

    bugs.forEach(bug => {
      const date = new Date(bug.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          bugs: 0,
          paid: 0,
        };
      }

      monthlyMap[monthKey].bugs += 1;

      if (bug.status === "approved") {
        monthlyMap[monthKey].paid += Number(bug.reward) || 0;
      }
    });

    const monthlyTrend = Object.values(monthlyMap).sort(
      (a, b) => new Date(a.month) - new Date(b.month)
    );

    res.json({
      walletBalance: company.walletBalance || 0,
      totalBugs: bugs.length,
      pendingBugs: submitted.length,
      approvedBugs: approved.length,
      rejectedBugs: rejected.length,
      totalPaid,
      monthlyTrend   // 👈 NEW DATA
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ msg: err.message });
  }
};