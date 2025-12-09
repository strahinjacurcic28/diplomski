import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./Workouts.css";
import Calendar from "react-calendar";
import { formatDate } from "../../util/FormatDate";

const Workouts = () => {
  const { token } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState(new Date());
  const [fullWorkouts, setFullWorkouts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/workouts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setWorkouts(data);
        const workoutDates = data.map((e) => new Date(e.date));
        setDates(workoutDates);
      })
      .catch((err) => console.error(err));

    fetch("http://localhost:5000/workouts/full", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFullWorkouts(data))
      .catch((err) => console.error(err));
  }, [token]);

  const selectedDateStr = date.toDateString();
  const filteredWorkouts = fullWorkouts.filter(
    (w) => new Date(w.workout_date).toDateString() === selectedDateStr
  );

  return (
    <div className="workout-wrapper">
      <div >
        <div className="workout-calendar">
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={({ date: currentDate, view }) => {
              if (view === "month") {
                const isWorkoutDay = dates.some(
                  (d) => d.toDateString() === currentDate.toDateString()
                );
                return isWorkoutDay ? "workout-day" : "no-workout-day";
              }
            }}
          />
        </div>

        <div className="workout-container ">
          {filteredWorkouts.length === 0 ? (
            <p>No workout for this day.</p>
          ) : (
            filteredWorkouts.map((workout) => (
              <div
                key={workout.workout_id}
              >
                <h2>
                  {formatDate(workout.workout_date)}
                </h2>
                <h2>{workout.workout_name}</h2>
                <p>Notes: {workout.workout_notes}</p>

                <h3>Exercises:</h3>
                {workout.exercises.map((exercise) => (
                  <div
                    key={exercise.exercise_id}
                  >
                    <h4>{exercise.exercise_name}</h4>
                    <p>Equipment: {exercise.exercise_equipment}</p>

                    <h4>Sets:</h4>
                    {exercise.sets && exercise.sets.length > 0 ? (
                      <ol>
                        {exercise.sets.map((set) => (
                          <li key={set.set_id}>
                            Reps: {set.reps}, Weight: {set.weight} kg, RIR:{" "}
                            {set.rir}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p>No sets recorded</p>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <Link to="/workout_builder">
          <button>Start New Workout</button>
        </Link>
      </div>
    </div>
  );
};

export default Workouts;
