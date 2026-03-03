const axios = require("axios");
const https = require("https");
const Bug = require("../models/Bug");
const { URL } = require("url");

exports.runSandboxValidation = async (req, res) => {
  try {
    const bugId = req.params.bugId;

    if (!bugId) {
      return res.status(400).json({
        success: false,
        msg: "Bug ID is required",
      });
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        msg: "Bug not found",
      });
    }

    if (!bug.testUrl || !bug.payload) {
      return res.status(400).json({
        success: false,
        msg: "Missing URL or payload in bug report",
      });
    }

    // Validate URL format
    let targetUrl;
    try {
      targetUrl = new URL(bug.testUrl);
    } catch {
      return res.status(400).json({
        success: false,
        msg: "Invalid test URL format",
      });
    }

    const axiosConfig = {
      timeout: 10000,
      validateStatus: () => true,
      maxRedirects: 2,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // ⚠ DEV ONLY
      }),
      headers: {
        "User-Agent": "BugBounty-Sandbox/1.0",
      },
    };

    // =========================
    // BASELINE REQUEST
    // =========================
    let baseline;
    try {
      baseline = await axios.get(targetUrl.toString(), axiosConfig);
    } catch (err) {
      return res.status(502).json({
        success: false,
        msg: "Failed to reach target server (baseline request)",
      });
    }

    // =========================
    // INJECTION REQUEST
    // =========================
    let injected;
    try {
      const injectedUrl = new URL(targetUrl.toString());
      injectedUrl.searchParams.append("test", bug.payload);

      injected = await axios.get(injectedUrl.toString(), axiosConfig);
    } catch (err) {
      return res.status(502).json({
        success: false,
        msg: "Failed to perform injected request",
      });
    }

    const baselineStr =
      typeof baseline.data === "string"
        ? baseline.data
        : JSON.stringify(baseline.data);

    const injectedStr =
      typeof injected.data === "string"
        ? injected.data
        : JSON.stringify(injected.data);

    // =========================
    // 🔥 ANALYSIS ENGINE
    // =========================
    let severity = "low";
    let riskScore = 5;
    let detected = "No vulnerability detected";
    let findings = [];
    let recommendation = "No action needed";

    // 1️⃣ Payload reflection
    if (injectedStr.includes(bug.payload)) {
      severity = "medium";
      riskScore = 45;
      detected = "Payload reflected in response";
      findings.push("User input is reflected in response");

      recommendation =
        "Sanitize and encode user input before rendering in response.";
    }

    // 2️⃣ Status code change
    if (baseline.status !== injected.status) {
      severity = "high";
      riskScore = 70;
      detected = "HTTP status changed after injection";
      findings.push(
        `Status changed from ${baseline.status} to ${injected.status}`
      );

      recommendation =
        "Validate and sanitize input to prevent abnormal behavior.";
    }

    // 3️⃣ SQL error detection
    const sqlPatterns = [
      /SQL syntax/i,
      /mysql/i,
      /ORA-/i,
      /PostgreSQL/i,
      /SQLite/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(injectedStr) && !pattern.test(baselineStr)) {
        severity = "critical";
        riskScore = 95;
        detected = "Possible SQL Injection vulnerability";
        findings.push("Database error message exposed");

        recommendation =
          "Use prepared statements and disable detailed DB error messages.";
        break;
      }
    }

    // =========================

    return res.json({
      success: true,
      baseline: {
        status: baseline.status,
      },
      injected: {
        status: injected.status,
      },
      analysis: {
        severity,
        riskScore,
        detected,
        findings,
        recommendation,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Sandbox Error:", err);

    return res.status(500).json({
      success: false,
      msg: "Sandbox execution failed",
    });
  }
};