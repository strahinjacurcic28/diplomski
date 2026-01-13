import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./WorkoutBuilder.css";
import Button from "../Button/Button";
import { apiRequest } from "../../api/Api";

export default function WorkoutBuilder() {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [workout, setWorkout] = useState({
    name: "",
    duration: 0,
    notes: "",
    exercises: [],
  });

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
        alert("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [token]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/workouts/full/${id}`, "GET", null, token);

        setWorkout({
          name: data.workout_name,
          duration: data.workout_duration ?? 0,
          notes: data.workout_notes ?? "",
          exercises: data.exercises.map((ex, exIndex) => ({
            exercise_id: ex.exercise_id,
            name: ex.exercise_name,
            muscle_group: ex.exercise_muscle_group,
            equipment: ex.exercise_equipment,
            order_index: exIndex,
            sets: ex.sets.map((s, i) => ({
              set_id: s.set_id,
              set_number: i + 1,
              weight: s.weight,
              reps: s.reps,
              rir: s.rir,
            })),
          })),
        });
      } catch (err) {
        console.error("Failed to load workout", err);
        alert("Failed to load workout for editing");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id, token, isEditMode]);

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
          equipment: exercise.equipment,
          order_index: prev.exercises.length,
          sets: [],
        },
      ],
    }));

    setSelectedExerciseId("");
  };

  const addSet = (exIndex) => {
    setWorkout((prev) => {
      const updated = { ...prev };
      const ex = updated.exercises[exIndex];
      const lastSet = ex.sets[ex.sets.length - 1];

      ex.sets.push({
        set_number: lastSet ? lastSet.set_number + 1 : 1,
        weight: lastSet ? lastSet.weight : Number(setInputs.weight),
        reps: lastSet ? lastSet.reps : Number(setInputs.reps),
        rir: lastSet ? lastSet.rir : Number(setInputs.rir),
      });

      return updated;
    });

    setSetInputs({ weight: "", reps: "", rir: "" });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setWorkout((prev) => {
      const updated = { ...prev };
      updated.exercises[exIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const handleDeleteExercise = (exIndex) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises
        .filter((_, i) => i !== exIndex)
        .map((ex, i) => ({ ...ex, order_index: i })),
    }));
  };

  const handleDeleteSet = (exIndex, setIndex) => {
    setWorkout((prev) => {
      const updated = { ...prev };
      const sets = updated.exercises[exIndex].sets
        .filter((_, i) => i !== setIndex)
        .map((s, i) => ({ ...s, set_number: i + 1 }));

      updated.exercises[exIndex].sets = sets;
      return updated;
    });
  };

  const finishWorkout = async () => {
    if (!workout.name.trim()) {
      alert("Workout name is required");
      return;
    }

    if (workout.exercises.length === 0) {
      alert("Add at least one exercise");
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await apiRequest(`/workouts/full/${id}`, "PUT", workout, token);
        alert("Workout updated successfully");
      } else {
        await apiRequest("/workouts/full", "POST", workout, token);
        alert("Workout saved successfully");
      }

      navigate("/workouts");
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="workout-builder-wrapper">
      <div className="workout-builder-container">
        <h1 className="workout-builder-title">
          {isEditMode ? "Edit Workout" : "Start Workout"}
        </h1>

        {loading && <p>Loading...</p>}

        <input
          type="text"
          className="workout-builder-name"
          placeholder="Workout Name"
          value={workout.name}
          onChange={(e) =>
            setWorkout({ ...workout, name: e.target.value })
          }
        />

        <textarea
          className="workout-builder-notes"
          placeholder="Notes"
          value={workout.notes}
          onChange={(e) =>
            setWorkout({ ...workout, notes: e.target.value })
          }
        />

        <div className="exercise-select-wrapper">
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

          <Button
            variant="add-exercise"
            handleClick={addExercise}
            disabled={!selectedExerciseId}
          >
            Add Exercise
          </Button>
        </div>

        {workout.exercises.map((ex, exIndex) => (
          <div className="exercise-card" key={exIndex}>
            <h2>{ex.name}</h2>
            <p>{ex.muscle_group} • {ex.equipment}</p>

            {ex.sets.map((s, setIndex) => (
              <div key={setIndex} className="ex-set">
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
                <Button
                  variant="delete-set"
                  handleClick={() => handleDeleteSet(exIndex, setIndex)}
                >
                  Delete
                </Button>
              </div>
            ))}

            <Button variant="submit" handleClick={() => addSet(exIndex)}>+ Add Set</Button>
            <Button
              variant="remove-ex"
              handleClick={() => handleDeleteExercise(exIndex)}
            >
              Remove Exercise
            </Button>
          </div>
        ))}

        <Button
          variant="submit"
          handleClick={finishWorkout}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : isEditMode
            ? "Update Workout"
            : "Finish Workout"}
        </Button>
      </div>
    </div>
  );
}
