import React, { useState, useEffect } from 'react';
import './App.css';

const DEFAULT_TASKS = [
  { id: '1', title: 'Design user onboarding flow', status: 'todo', priority: 'High' },
  { id: '2', title: 'Research competitors API', status: 'todo', priority: 'Medium' },
  { id: '3', title: 'Setup Vite + React environment', status: 'in-progress', priority: 'High' },
  { id: '4', title: 'Draft initial wireframes', status: 'done', priority: 'Low' }
];

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'done', title: 'Done', color: '#10b981', bg: '#ecfdf5' }
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kanban_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;

    if (id) {
      setTasks(prev => prev.map(task => {
        if (task.id === id) {
          return { ...task, status: targetColumnId };
        }
        return task;
      }));
    }
    setDraggedTaskId(null);
  };

  const moveTask = (taskId, targetStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: targetStatus } : task
    ));
  };

  const visibleTasks = priorityFilter === 'All'
    ? tasks
    : tasks.filter(task => task.priority === priorityFilter);

  return (
    <div className="kanban-app-container">
      <header className="kanban-header">
        <div className="title-group">
          <h1>📋 Project Kanban Board</h1>
          <p>Drag & drop tasks to update progress</p>
        </div>

        {/* Quick Add Task */}
        <form onSubmit={handleAddTask} className="add-task-form">
          <input
            type="text"
            placeholder="Add new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="task-input"
            required
          />
          <select 
            value={newTaskPriority} 
            onChange={(e) => setNewTaskPriority(e.target.value)}
            className="priority-select"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit" className="add-btn">+ Add Task</button>
        </form>
      </header>

      {/* Board Columns */}
      <div className="board-grid">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`kanban-column ${isOver ? 'column-drag-over' : ''}`}
              style={{ backgroundColor: col.bg }}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header" style={{ borderTopColor: col.color }}>
                <div className="column-title">
                  <h2>{col.title}</h2>
                  <span className="count-badge" style={{ backgroundColor: col.color }}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              <div className="task-list">
                {colTasks.length === 0 ? (
                  <div className="empty-dropzone">Drop tasks here</div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-card ${draggedTaskId === task.id ? 'is-dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="task-card-header">
                        <span className={`priority-tag priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <button 
                          className="delete-task-btn" 
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>

                      <p className="task-title">{task.title}</p>

                      {/* Quick Move Arrows for Touch/Mobile */}
                      <div className="quick-actions">
                        {col.id !== 'todo' && (
                          <button 
                            className="move-btn"
                            onClick={() => moveTask(task.id, col.id === 'done' ? 'in-progress' : 'todo')}
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button 
                            className="move-btn"
                            onClick={() => moveTask(task.id, col.id === 'todo' ? 'in-progress' : 'done')}
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

