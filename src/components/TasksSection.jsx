import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const TasksSection = ({ tasks, onTasksChange }) => {
  const { isDark } = useTheme()

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      text: '',
      completed: false
    }
    onTasksChange([...tasks, newTask])
  }

  const removeTask = (taskId) => {
    onTasksChange(tasks.filter(task => task.id !== taskId))
  }

  const updateTask = (taskId, field, value) => {
    onTasksChange(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ))
  }

  return (
    <div className="section section-tasks">
      <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${
        isDark ? 'text-blue-200' : 'text-blue-800'
      }`}>
        <span className="text-2xl">✅</span>
        Daily Tasks
      </h3>
      <div>
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center flex-wrap gap-3 mb-3 p-3 rounded-xl border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700/60 border-gray-600' 
              : 'bg-white/60 border-blue-100'
          }`}>
            <input 
              type="checkbox" 
              className={`w-5 h-5 rounded ${
                isDark ? 'accent-cyan-400' : 'accent-cyan-500'
              }`}
              checked={task.completed}
              onChange={(e) => updateTask(task.id, 'completed', e.target.checked)}
            />
            {/* Multiline, mobile-friendly task input */}
            <textarea 
              rows={1}
              className={`flex-1 min-w-[220px] px-3 py-2 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 resize-none break-words whitespace-pre-wrap ${
                isDark 
                  ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700/80 text-gray-200 placeholder-gray-400' 
                  : 'border-blue-200 focus:border-cyan-400 focus:ring-cyan-100 bg-white/80 text-gray-800 placeholder-gray-500'
              }`}
              value={task.text}
              onChange={(e) => {
                updateTask(task.id, 'text', e.target.value)
                // Auto-grow height to fit content
                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
              placeholder="New task..."
            />
            <button 
              className={`text-xl transition-colors duration-200 p-1 rounded-full ${
                isDark 
                  ? 'text-red-300 hover:text-red-400 hover:bg-red-900/20' 
                  : 'text-red-400 hover:text-red-600 hover:bg-red-50'
              }`}
              onClick={() => removeTask(task.id)}
            >
              🗑️
            </button>
          </div>
        ))}
        <button 
          className={`w-full py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 font-medium ${
            isDark 
              ? 'border-cyan-500 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 text-cyan-400 hover:border-cyan-400 hover:from-cyan-800/40 hover:to-blue-800/40 hover:text-cyan-300' 
              : 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 hover:border-cyan-400 hover:from-cyan-100 hover:to-blue-100 hover:text-cyan-700'
          }`}
          onClick={addTask}
        >
          + Add New Task
        </button>
      </div>
    </div>
  )
}

export default TasksSection 