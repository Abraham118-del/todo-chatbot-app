import { useEffect, useMemo, useState } from "react";
import "./App.css";

function parseTask(text) {
  const lower = text.toLowerCase();
  const now = new Date();
  let suggested = "";
  let date = "";
  let time = "";

  if (lower.includes("today")) {
    date = now.toISOString().split("T")[0];
    time = "18:00";
  } else if (lower.includes("tomorrow")) {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    date = t.toISOString().split("T")[0];
    time = "18:00";
  }

  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] || "00";
    const meridian = timeMatch[3]?.toLowerCase();
    if (meridian === "pm" && hour < 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;
    time = `${String(hour).padStart(2, "0")}:${minute}`;
  }

  if (!date) {
    const next = new Date(now);
    next.setDate(next.getDate() + 2);
    date = next.toISOString().split("T")[0];
    suggested = "No deadline found — suggested one automatically.";
  }

  if (!time) time = "17:00";

  const title =
    text
      .replace(/today|tomorrow|by|before|at|\d{1,2}(:\d{2})?\s?(am|pm)?/gi, "")
      .trim() || "Untitled Task";

  return { title, date, time, suggested };
}

function App() {
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("todo-chatbot-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("todo-chatbot-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTaskFromChat = () => {
    if (!message.trim()) return;
    const task = parseTask(message);
    setTasks((prev) => [...prev, { ...task, id: Date.now(), done: false }]);
    setMessage("");
  };

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearAllTasks = () => {
    const confirmClear = window.confirm("Are you sure you want to delete all tasks?");
    if (confirmClear) {
      setTasks([]);
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );
  }, [tasks]);

  const completedCount = tasks.filter((task) => task.done).length;

  return (
    <div className="app">
      <div className="hero">
        <p className="tag">Smart Planner</p>
        <h1>Todo Chatbot Assistant</h1>
        <p className="hero-text">
          Type your tasks naturally and let the app organize deadlines for you.
        </p>
      </div>

      <div className="container">
        <div className="left-panel">
          <div className="panel-header">
            <h2>🧠 Chat Input</h2>
            <p>Example: “Finish assignment tomorrow at 8 pm”</p>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your task here..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addTaskFromChat();
              }
            }}
          />

          <button onClick={addTaskFromChat} className="main-btn">
            + Add Task
          </button>
        </div>

        <div className="right-panel">
          <div className="panel-header">
            <h2>📌 Upcoming Tasks</h2>
            <p>Sorted by nearest deadline</p>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <span>Total</span>
              <strong>{tasks.length}</strong>
            </div>
            <div className="stat-box">
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </div>
          </div>

          {tasks.length > 0 && (
            <button className="clear-btn" onClick={clearAllTasks}>
              Clear All Tasks
            </button>
          )}

          {sortedTasks.length === 0 ? (
            <div className="empty-box">
              <p>No tasks yet.</p>
              <span>Add your first task using the chatbot.</span>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div className="task-left">
                  <h3 className={task.done ? "done" : ""}>{task.title}</h3>
                  <div className="task-meta">
                    <span>📅 {task.date}</span>
                    <span>⏰ {task.time}</span>
                  </div>
                  {task.suggested && (
                    <p className="suggestion">{task.suggested}</p>
                  )}
                </div>

                <div className="task-buttons">
                  <button
                    className="small-btn complete-btn"
                    onClick={() => toggleDone(task.id)}
                  >
                    ✔
                  </button>
                  <button
                    className="small-btn delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;