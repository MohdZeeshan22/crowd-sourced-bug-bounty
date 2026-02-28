const User = require("../models/User");
const BugReport = require("../models/BugReport");

exports.adminOverview = async (req, res) => {
  try {
    // Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admin only" });
    }

    const totalUsers = await User.countDocuments();
    const totalBugs = await BugReport.countDocuments();
    const approvedBugs = await BugReport.countDocuments({ status: "approved" });
    const rejectedBugs = await BugReport.countDocuments({ status: "rejected" });
    const pendingBugs = await BugReport.countDocuments({ status: "submitted" });

    res.json({
      totalUsers,
      totalBugs,
      approvedBugs,
      rejectedBugs,
      pendingBugs
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
