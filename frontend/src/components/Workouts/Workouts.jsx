import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./Workouts.css";
import Calendar from "react-calendar";
import { formatDate } from "../../util/FormatDate";
import Button from "../Button/Button";
import { apiRequest } from "../../api/Api";

const Workouts = () => {
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState(new Date());
  const [fullWorkouts, setFullWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const [workoutsData, fullWorkoutsData] = await Promise.all([
          apiRequest("/workouts", "GET", null, token),
          apiRequest("/workouts/full", "GET", null, token),
        ]);

        setWorkouts(workoutsData);
        setFullWorkouts(fullWorkoutsData);

        const workoutDates = workoutsData.map((e) => new Date(e.date));
        setDates(workoutDates);
      } catch (err) {
        console.error("Error fetching workouts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [token]);

  const deleteWorkout = async (workoutId) => {
    try {
      await apiRequest(`/workouts/${workoutId}`, "DELETE", null, token);

      setFullWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
      setWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
      setDates((prev) =>
        prev.filter(
          (d) =>
            d.toDateString() !==
            new Date(
              fullWorkouts.find((w) => w.workout_id === workoutId)?.workout_date
            ).toDateString()
        )
      );
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  const selectedDateStr = date.toDateString();
  const filteredWorkouts = fullWorkouts.filter(
    (w) => new Date(w.workout_date).toDateString() === selectedDateStr
  );

  return (
    <div className="workout-wrapper">
      <div>
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
            <>
              <h5 className="no-workout">Selected date: {formatDate(date)}</h5>
              <h5 className="no-workout">No workout has been done on this day.</h5>
            </>
          ) : (
            filteredWorkouts.map((workout) => (
              <div key={workout.workout_id}>
                <h2>{formatDate(workout.workout_date)}</h2>
                <h2>{workout.workout_name}</h2>
                <p>Notes: {workout.workout_notes}</p>

                <h3>Exercises:</h3>
                {(workout.exercises || []).map((exercise) => (
                  <div key={exercise.exercise_id}>
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
                <Button
                  variant="delete-workout"
                  handleClick={() => deleteWorkout(workout.workout_id)}
                >
                  Delete Workout
                </Button>
                <Link to={`/workout_builder/${workout.workout_id}`}>
                  <Button variant="edit-workout">
                    Edit Workout
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>

        <Link to="/workout_builder">
          <Button variant="submit">Start New Workout</Button>
        </Link>
      </div>
    </div>
  );
};

export default Workouts;
