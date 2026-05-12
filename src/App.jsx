import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Check, Moon, Sun } from 'lucide-react'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState('all')
  const [darkMode, setDarkMode] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tasks')
    if (saved) setTasks(JSON.parse(saved))
    const savedDark = localStorage.getItem('darkMode')
    if (savedDark !== null) setDarkMode(JSON.parse(savedDark))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const addTask = () => {
    if (!newTask.trim()) return
    const task = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    setTasks([task, ...tasks])
    setNewTask('')
  }

  const toggleComplete = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditText(task.text)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    setTasks(tasks.map(t => 
      t.id === editingId ? { ...t, text: editText.trim() } : t
    ))
    setEditingId(null)
    setEditText('')
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter">Todo</h1>
            <p className="text-zinc-400">Stay focused. Get things done.</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl">
          {/* Add Task */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done?"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-violet-500 placeholder:text-zinc-500"
            />
            <button 
              onClick={addTask}
              className="bg-violet-600 hover:bg-violet-700 px-8 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            >
              <Plus size={22} />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 tabular-nums">{progress}%</span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-1.5 rounded-full text-sm transition-all ${filter === f 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No tasks here
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700/80 rounded-2xl px-5 py-4 transition-all"
                  >
                    <button 
                      onClick={() => toggleComplete(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-zinc-600 hover:border-zinc-400'}`}
                    >
                      {task.completed && <Check size={14} className="text-white" />}
                    </button>

                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        onBlur={saveEdit}
                        className="flex-1 bg-transparent border-b border-zinc-600 focus:outline-none text-lg"
                        autoFocus
                      />
                    ) : (
                      <span 
                        onClick={() => startEdit(task)}
                        className={`flex-1 text-lg cursor-pointer ${task.completed ? 'line-through text-zinc-500' : ''}`}
                      >
                        {task.text}
                      </span>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(task)} className="p-2 hover:bg-zinc-600 rounded-lg">
                        <Edit2 size={16} className="text-zinc-400" />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-900/50 rounded-lg">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center text-xs text-zinc-500">
            {tasks.length} tasks • {completedCount} completed
          </div>
        </div>
      </div>
    </div>
  )
}

export default App