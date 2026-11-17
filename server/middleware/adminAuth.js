// Lightweight shared-passcode auth. This is intentionally simple: it's meant
// to keep casual/curious people out of the guest list, not to withstand a
// determined attacker. Good enough for a one-off school event; don't reuse
// this pattern for anything storing sensitive data long-term.
function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ error: "Server is missing ADMIN_KEY config." });
  }
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Incorrect passcode." });
  }
  next();
}

module.exports = adminAuth;
