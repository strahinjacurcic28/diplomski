const bodyStatsRepo = require("../repositories/bodyStats.sql");

module.exports = {
  getBodyStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await bodyStatsRepo.getStatsByUserId(userId);
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  },

  addBodyStat: async (req, res) => {
    try {
      const userId = req.user.id;
      const { weight, body_fat } = req.body;

      if (weight == null || body_fat == null)
        return res.status(400).json({ error: "Weight and body fat are required" });

      const statId = await bodyStatsRepo.addStat(userId, weight, body_fat);
      res.status(201).json({ message: "Body stats added successfully", id: statId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateBodyStat: async (req, res) => {
    try {
      const userId = req.user.id;
      const statId = req.params.id;
      let { column, value } = req.body;

      const allowedColumns = ["weight", "body_fat"];
      if (!column || !allowedColumns.includes(column))
        return res.status(400).json({ error: "Invalid or missing column" });

      const result = await bodyStatsRepo.updateStat(statId, userId, column, value);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Body stat not found" });

      res.status(200).json({ message: "Body stat updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update body stat" });
    }
  },
};
