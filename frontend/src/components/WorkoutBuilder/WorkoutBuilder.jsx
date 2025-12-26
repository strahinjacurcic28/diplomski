import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./WorkoutBuilder.css";
import Button from "../Button/Button";
import { apiRequest } from "../../api/Api";

export default function WorkoutBuilder() {
  const [workout, setWorkout] = useState({
    name: "",
    duration: 0,
    notes: "",
    exercises: [],
  });

  const { token } = useContext(AuthContext);
  const [exercisesList, setExercisesList] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [setInputs, setSetInputs] = useState({ weight: "", reps: "", rir: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const data = await apiRequest("/exercises", "GET", null, token);
        setExercisesList(data);
      } catch (err) {
        console.error("Failed to fetch exercises", err);
        alert(`Error fetching exercises: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [token]);

  const addExercise = () => {
    const exercise = exercisesList.find(
      (ex) => ex.id === Number(selectedExerciseId)
    );
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
    setSelectedExerciseId("");
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
    // Basic validation
    if (!workout.name.trim()) {
      alert("Please enter a workout name");
      return;
    }
    
    if (workout.exercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    setSaving(true);
    try {
      const data = await apiRequest("/workouts/full", "POST", workout, token);
      console.log("Workout saved successfully:", data);
      alert("Workout saved!");
      
      // Reset form after successful save
      setWorkout({
        name: "",
        duration: 0,
        notes: "",
        exercises: [],
      });
      setSelectedExerciseId("");
      setSetInputs({ weight: "", reps: "", rir: "" });
      
    } catch (err) {
      console.error("Error saving workout:", err);
      alert(`Error saving workout: ${err.message || "Please try again"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = (exIndex) => {
    setWorkout((prev) => {
      const newExercises = prev.exercises.filter((_, index) => index !== exIndex);
      // Reindex order_index
      const reindexedExercises = newExercises.map((ex, index) => ({
        ...ex,
        order_index: index,
      }));
      return { ...prev, exercises: reindexedExercises };
    });
  };

  const handleDeleteSet = (exIndex, setIndex) => {
  setWorkout((prev) => {
    const updated = { ...prev };
    
    const updatedExercises = [...updated.exercises];
    const exerciseToUpdate = { ...updatedExercises[exIndex] };
    
    const updatedSets = exerciseToUpdate.sets.filter(
      (_, index) => index !== setIndex
    );
    
    const renumberedSets = updatedSets.map((set, index) => ({
      ...set,
      set_number: index + 1,
    }));
    
    exerciseToUpdate.sets = renumberedSets;
    updatedExercises[exIndex] = exerciseToUpdate;
    
    return {
      ...updated,
      exercises: updatedExercises
    };
  });
};

  return (
    <div className="workout-builder-wrapper">
      <div className="workout-builder-container">
        <h1 className="workout-builder-title">Start Workout</h1>

        {loading && <p className="loading-message">Loading exercises...</p>}

        <div className="workout-info">
          <input
            type="text"
            className="workout-builder-name"
            placeholder="Workout Name (Required)"
            value={workout.name}
            onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
          />

          <textarea
            className="workout-builder-notes"
            placeholder="Notes"
            value={workout.notes}
            onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
          />
        </div>

        <div className="exercise-select-wrapper">
          <select
            className="exercise-select"
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Exercise</option>
            {exercisesList.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <Button
            handleClick={addExercise}
            variant="add-exercise"
            disabled={!selectedExerciseId}
          >
            Add Exercise
          </Button>
        </div>

        <div className="exercises-wrapper">
          {workout.exercises.length === 0 ? (
            <p className="no-exercises">No exercises added yet. Select an exercise above.</p>
          ) : (
            workout.exercises.map((ex, exIndex) => (
              <div className="exercise-card" key={exIndex}>
                <div className="exercise-header">
                  <h2 className="exercise-name">{ex.name}</h2>
                  <Button
                    variant="submit"
                    handleClick={() => handleDeleteExercise(exIndex)}
                  >
                    Remove
                  </Button>
                </div>
                <p className="exercise-info">
                  {ex.muscle_group} • {ex.equipment}
                </p>

                {ex.sets.length === 0 ? (
                  <p className="no-sets">No sets added for this exercise.</p>
                ) : (
                  <div className="sets-table">
                    <div className="sets-header">
                      <span>Set</span>
                      <span>Weight (kg)</span>
                      <span>Reps</span>
                      <span>RIR</span>
                      <span></span>
                    </div>
                    {ex.sets.map((s, setIndex) => (
                      <div className="ex-set" key={setIndex}>
                        <span className="set-number">{s.set_number}</span>
                        <input
                          type="number"
                          className="set-input"
                          value={s.weight}
                          onChange={(e) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              "weight",
                              Number(e.target.value)
                            )
                          }
                        />
                        <input
                          type="number"
                          className="set-input"
                          value={s.reps}
                          onChange={(e) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              "reps",
                              Number(e.target.value)
                            )
                          }
                        />
                        <input
                          type="number"
                          className="set-input"
                          value={s.rir}
                          onChange={(e) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              "rir",
                              Number(e.target.value)
                            )
                          }
                        />
                        <Button
                          variant="delete-set"
                          handleClick={() => handleDeleteSet(exIndex, setIndex)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="submit" handleClick={() => addSet(exIndex)}>
                  + Add Set
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="finish-workout">
          <Button
            variant="submit"
            handleClick={finishWorkout}
            disabled={saving || workout.exercises.length === 0 || !workout.name.trim()}
          >
            {saving ? "Saving..." : "Finish Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}