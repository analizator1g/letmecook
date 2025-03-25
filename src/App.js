import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';

const TimeTrackingApp = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTaskName, setNewTaskName] = useState('');
  const [activeTimers, setActiveTimers] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Zapisuj zadania w localStorage za każdym razem gdy się zmieniają
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Real-time timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Funkcja do formatowania czasu w formacie HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const addTask = (taskName) => {
    const newTask = {
      id: Date.now(),
      name: taskName,
      date: new Date().toLocaleDateString(),
      totalTime: 0,
      sessions: []
    };
    
    const newActiveTimers = {
      [newTask.id]: {
        startTime: Date.now(),
        isRunning: true
      }
    };
    
    setTasks([newTask, ...tasks]);
    setActiveTimers(prev => ({...prev, ...newActiveTimers}));
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
      const duration = Math.round((Date.now() - timer.startTime) / 1000);
      
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
    
    const newActiveTimers = {...activeTimers};
    delete newActiveTimers[taskId];
    setActiveTimers(newActiveTimers);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Śledzenie Czasu</h1>
      
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

      {tasks.map((task) => {
        const activeTimer = activeTimers[task.id];
        const currentTimerTime = activeTimer && activeTimer.isRunning 
          ? task.totalTime + Math.round((currentTime - activeTimer.startTime) / 1000)
          : task.totalTime;

        return (
          <div key={task.id} className="border p-3 mb-2 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">{task.date}</div>
                <div className="font-medium">{task.name}</div>
                <div className="text-sm text-gray-600">
                  Całkowity czas: {formatTime(currentTimerTime)}
                </div>
              </div>
              <div className="flex items-center">
                {activeTimer?.isRunning ? (
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
        );
      })}
    </div>
  );
};

export default TimeTrackingApp;