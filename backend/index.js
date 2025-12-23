const express = require('express')
const cors = require("cors");
const app = express()

const users = require('./routes/users')
const body_stats = require('./routes/body-stats')
const workouts = require('./routes/workouts')
const exercises = require("./routes/exercises");
const auth = require('./routes/auth')
const workout_exercises = require('./routes/workout_exercises')
const sets = require('./routes/sets')

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use('/users', users)
app.use('/body_stats', body_stats)
app.use('/workouts', workouts)
app.use("/exercises", exercises);
app.use("/login", auth);
app.use("/workout_exercises", workout_exercises);
app.use("/sets", sets);


app.listen(5000, ()=>{
    console.log("Running")
})