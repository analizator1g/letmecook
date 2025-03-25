import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';

const TimeTrackingApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [activeTimers, setActiveTimers] = useState({});

  const addTask = (taskName) => {
    const newTask = {
      id: Date.now(),
      name: taskName,
      date: new Date().toLocaleDateString(),
      totalTime: 0,
      sessions: []
    };
    setTasks([newTask, ...tasks]);
  };

  const startTimer = (taskId) => {
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: {
        startTime: Date.now(),
        isRunning: true
      }
    }));
  };

  const stopTimer = (taskId) => {
    const timer = activeTimers[taskId];
    if (timer && timer.isRunning) {
      const duration = Math.round((Date.now() - timer.startTime) / 1000 / 60);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId 
          ? {
              ...task, 
              totalTime: task.totalTime + duration,
              sessions: [...task.sessions, {
                start: new Date(timer.startTime),
                duration: duration
              }]
            }
          : task
      ));

      const newActiveTimers = {...activeTimers};
      delete newActiveTimers[taskId];
      setActiveTimers(newActiveTimers);
    }
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${minutes}m`;
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Śledzenie Czasu</h1>
      
      {/* Formularz dodawania zadania */}
      <div className="flex mb-4">
        <input 
          type="text" 
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Nazwa zadania" 
          className="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick={() => {
            if (newTaskName.trim()) {
              addTask(newTaskName);
              setNewTaskName('');
            }
          }}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Dodaj Zadanie
        </button>
      </div>

      {/* Lista zadań */}
      {tasks.map((task) => (
        <div key={task.id} className="border p-3 mb-2 rounded">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">{task.date}</div>
              <div className="font-medium">{task.name}</div>
              <div className="text-sm text-gray-600">
                Całkowity czas: {formatTime(task.totalTime)}
              </div>
            </div>
            <div className="flex items-center">
              {activeTimers[task.id]?.isRunning ? (
                <button 
                  onClick={() => stopTimer(task.id)}
                  className="bg-red-500 text-white p-2 rounded mr-2"
                >
                  <Pause />
                </button>
              ) : (
                <button 
                  onClick={() => startTimer(task.id)}
                  className="bg-green-500 text-white p-2 rounded mr-2"
                >
                  <Play />
                </button>
              )}
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-red-500"
              >
                <Trash2 />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimeTrackingApp;