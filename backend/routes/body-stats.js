const express = require('express');
const router = express.Router();
const cors = require('cors')
const auth = require("../middleware/authentication");

router.use(cors())
const mysql = require('mysql')

const db = mysql.createPool({
    user: 'root',
    password: 'root',
    host: 'localHost',
    database: 'training_tracker'
})

router.get('/', auth, (req, res)=> {
    const user_id = req.user.id 
    db.query(`SELECT body_stats.* FROM body_stats where user_id = ${user_id};`, (err, result) => {
        if(err){
            console.log(err)
        }

        res.send(result)
    })
})

router.post('/', auth, (req, res) => {
  const user_id = req.user.id
  const {weight, body_fat} = req.body

  db.query(
    'INSERT INTO body_stats (user_id, date, weight, body_fat) VALUES (?, NOW(), ?, ?)', 
    [user_id, weight, body_fat],
    (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: "Body stats added successfully" });
        }
    )
})

router.put("/:id", auth, (req, res) => {
  const statId = req.params.id;
  const userId = req.user.id;
  const { column, value } = req.body;

  if (!column) {
    return res.status(400).json({ error: "Column name is required" });
  }

  const allowedColumns = ["weight", "body_fat"];
  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ error: "Invalid column" });
  }

  db.query(
    `UPDATE body_stats 
     SET ${column} = ?, date = NOW()
     WHERE id = ? AND user_id = ?`,
    [value, statId, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update body stat" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Body stat not found" });
      }

      res.status(200).json({
        message: "Body stat updated successfully"
      });
    }
  );
});



module.exports = router
