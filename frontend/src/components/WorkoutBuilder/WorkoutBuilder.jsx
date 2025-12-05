import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function WorkoutBuilder() {
  const [workout, setWorkout] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    duration: 0,
    notes: "",
    exercises: [],
  });

  const { token } = useContext(AuthContext);
  const [exercisesList, setExercisesList] = useState([]); // all exercises for select
  const [selectedExerciseId, setSelectedExerciseId] = useState(""); 
  const [setInputs, setSetInputs] = useState({ weight: "", reps: "", rir: "" });

  // Fetch exercises from backend
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("http://localhost:5000/exercises", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setExercisesList(data);
      } catch (err) {
        console.error("Failed to fetch exercises", err);
      }
    };
    fetchExercises();
  }, [token]);

  const addExercise = () => {
    const exercise = exercisesList.find((ex) => ex.id === Number(selectedExerciseId));
    if (!exercise) return;

    setWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exercise_id: exercise.id,
          name: exercise.name,
          muscle_group: exercise.muscle_group,
          type: exercise.type,
          description: exercise.description,
          equipment: exercise.equipment,
          order_index: prev.exercises.length,
          sets: [],
        },
      ],
    }));
    setSelectedExerciseId(""); // reset select
  };

  const addSet = (exIndex) => {
    const ex = workout.exercises[exIndex];
    const lastSet = ex.sets[ex.sets.length - 1] || null;

    const newSet = {
      set_number: lastSet ? lastSet.set_number + 1 : 1,
      weight: lastSet ? lastSet.weight : Number(setInputs.weight),
      reps: lastSet ? lastSet.reps : Number(setInputs.reps),
      rir: lastSet ? lastSet.rir : Number(setInputs.rir),
    };

    const updated = { ...workout };
    updated.exercises[exIndex].sets.push(newSet);
    setWorkout(updated);
    setSetInputs({ weight: "", reps: "", rir: "" });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    const updated = { ...workout };
    updated.exercises[exIndex].sets[setIndex][field] = value;
    setWorkout(updated);
  };

  const finishWorkout = async () => {
    try {
      const response = await fetch("http://localhost:5000/workouts/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(workout),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(data);
      alert("Workout saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving workout");
    }
  };

  return (
    <div>
      <h1>Start Workout</h1>

      <input
        type="text"
        placeholder="Workout Name"
        value={workout.name}
        onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
      />
      <input
        type="date"
        value={workout.date}
        onChange={(e) => setWorkout({ ...workout, date: e.target.value })}
      />
      <textarea
        placeholder="Notes"
        value={workout.notes}
        onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
      />

      {/* Exercise Selection */}
      <div>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
        >
          <option value="">Select Exercise</option>
          {exercisesList.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
        <button onClick={addExercise}>+ Add Exercise</button>
      </div>

      {/* Exercises + sets */}
      {workout.exercises.map((ex, exIndex) => (
        <div key={exIndex}>
          <h2>{ex.name}</h2>

          {ex.sets.map((s, setIndex) => (
            <div key={setIndex}>
              <span>{s.set_number}</span>
              <input
                type="number"
                value={s.weight}
                onChange={(e) =>
                  updateSet(exIndex, setIndex, "weight", Number(e.target.value))
                }
              />
              <input
                type="number"
                value={s.reps}
                onChange={(e) =>
                  updateSet(exIndex, setIndex, "reps", Number(e.target.value))
                }
              />
              <input
                type="number"
                value={s.rir}
                onChange={(e) =>
                  updateSet(exIndex, setIndex, "rir", Number(e.target.value))
                }
              />
            </div>
          ))}

          <button onClick={() => addSet(exIndex)}>+ Add Set</button>
        </div>
      ))}

      <button onClick={finishWorkout}>Finish Workout</button>
    </div>
  );
}
