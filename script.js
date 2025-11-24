// === DOM ELEMENTS ===
const input = document.getElementById('new-task')
const addBtn = document.getElementById('add-btn')
const pendingList = document.getElementById('pending-list')
const completedList = document.getElementById('completed-list')

// === DATA ===
let tasks = []

// === LOCALSTORAGE ===
function loadTasks() {
  const saved = localStorage.getItem('samurai-todo')
  if (saved) tasks = JSON.parse(saved)
  render()
}
loadTasks()

function save() {
  localStorage.setItem('samurai-todo', JSON.stringify(tasks))
}

// === CREATE TASK ELEMENT ===
function createTaskElement(task) {
  const div = document.createElement('div')
  div.className = 'bg-gray-900 p-4 rounded-lg flex items-center justify-between cursor-move hover:bg-gray-800 transition'
  div.draggable = true
  div.dataset.id = task.id

  div.innerHTML = `
    <span class="task-text text-lg">${task.text}</span>
    <button class="text-red-500 hover:text-red-400">
      <i class="fas fa-trash"></i>
    </button>
  `

  div.querySelector('button').addEventListener('click', () => {
    tasks = tasks.filter(t => t.id !== task.id)
    save()
    render()
  })

  const span = div.querySelector('.task-text')
  if (task.completed) span.classList.add('line-through', 'text-gray-500')

  return div
}

// === RENDER ===
function render() {
  pendingList.innerHTML = ''
  completedList.innerHTML = ''

  tasks.forEach(task => {
    const el = createTaskElement(task)
    if (task.completed) {
      completedList.appendChild(el)
    } else {
      pendingList.appendChild(el)
    }
  })

  attachDragEvents()
}

// === ADD TASK ===
addBtn.addEventListener('click', () => {
  const text = input.value.trim()
  if (!text) return
  tasks.push({ id: Date.now(), text, completed: false })
  input.value = ''
  save()
  render()
})

input.addEventListener('keypress', e => {
  if (e.key === 'Enter') addBtn.click()
})

// === DRAG & DROP ===
function attachDragEvents() {
  // Drag start/end on items
  document.querySelectorAll('[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', item.dataset.id)
      item.classList.add('opacity-50')
    })
    item.addEventListener('dragend', () => item.classList.remove('opacity-50'))
  })

  // Drop zones
  ;[pendingList, completedList].forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault())
    zone.addEventListener('drop', e => {
      e.preventDefault()
      const id = Number(e.dataTransfer.getData('text/plain'))
      const task = tasks.find(t => t.id === id)
      if (task) {
        task.completed = (zone === completedList)
        save()
        render()
      }
    })
  })
}