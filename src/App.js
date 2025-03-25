import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { PlayIcon, PauseIcon, TrashIcon, Cross2Icon } from '@radix-ui/react-icons';

const TimeTrackingApp = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTaskName, setNewTaskName] = useState('');
  const [activeTimers, setActiveTimers] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    setTaskToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Śledzenie Czasu
        </h1>
        
        <div className="flex mb-6 space-x-2">
          <input 
            type="text" 
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Nazwa zadania" 
            className="flex-grow p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <button 
            onClick={() => {
              if (newTaskName.trim()) {
                addTask(newTaskName);
                setNewTaskName('');
              }
            }}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center space-x-2"
          >
            Dodaj
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => {
            const activeTimer = activeTimers[task.id];
            const currentTimerTime = activeTimer && activeTimer.isRunning 
              ? task.totalTime + Math.round((currentTime - activeTimer.startTime) / 1000)
              : task.totalTime;

            return (
              <div 
                key={task.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-between items-center hover:bg-gray-50 transition duration-200"
              >
                <div>
                  <div className="text-xs text-gray-500 mb-1">{task.date}</div>
                  <div className="text-lg font-semibold text-gray-800">{task.name}</div>
                  <div className="text-sm text-gray-600 font-mono">
                    Całkowity czas: {formatTime(currentTimerTime)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activeTimer?.isRunning ? (
                    <button 
                      onClick={() => stopTimer(task.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
                    >
                      <PauseIcon />
                    </button>
                  ) : (
                    <button 
                      onClick={() => startTimer(task.id)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition duration-200"
                    >
                      <PlayIcon />
                    </button>
                  )}
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <button 
                        onClick={() => setTaskToDelete(task.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition duration-200"
                      >
                        <TrashIcon />
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
                      <AlertDialog.Content className="fixed top-1/2 left-1/2 max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
                        <AlertDialog.Title className="text-lg font-semibold mb-2">
                          Usunąć zadanie?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-sm text-gray-600 mb-4">
                          Czy na pewno chcesz usunąć to zadanie? Tej operacji nie można cofnąć.
                        </AlertDialog.Description>
                        <div className="flex justify-end space-x-2">
                          <AlertDialog.Cancel className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                            Anuluj
                          </AlertDialog.Cancel>
                          <AlertDialog.Action 
                            onClick={() => deleteTask(taskToDelete)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Usuń
                          </AlertDialog.Action>
                        </div>
                        <AlertDialog.Close className="absolute top-4 right-4">
                          <Cross2Icon />
                        </AlertDialog.Close>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingApp;