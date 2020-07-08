import TodoInput from './TodoInput.js'
import TodoList from './TodoList.js'
import TodoCount from './TodoCount.js'
import TodoStatus from './TodoStatus.js'
import TodoDeleteAll from './TodoDeleteAll.js'
import { todoStatus } from '../utils/constant.js'
import { api } from '../api/api.js'

export default function TodoApp({
  teamId,
  memberId,
  username,
  todoList,
  $todoInput,
  $todoList,
  $todoCount,
  $todoStatus,
  $todoDeleteAll,
}) {
  if (!new.target) {
    throw new Error('TodoApp must be called with new')
  }

  // FIXME: implementing validator
  if (
    !$todoInput ||
    !$todoList ||
    !$todoCount ||
    !$todoStatus ||
    !$todoDeleteAll
  ) {
    throw new Error('$target must be injected')
  }

  const onAddTodo = async (text) => {
    await api.addTodo(this.teamId, this.memberId, { contents: text })
    this.setState(this.username)
  }

  const findTodoIdByStatus = (index) => {
    let id = null

    switch (this.todoViewStatus) {
      case todoStatus.ALL:
        id = this.todos[index]._id
        break

      case todoStatus.ACTIVE:
      case todoStatus.COMPLETED:
        const findIdx = this.todos.findIndex(
          (todo) => todo.contents === this.filteredTodos[index].contents
        )
        if (findIdx !== -1) {
          id = this.todos[findIdx]._id
        }
        break
    }
    return id
  }

  const onToggleTodo = async (index) => {
    const id = findTodoIdByStatus(index)
    if (id === null) {
      return
    }
    await api.toggleTodo(this.teamId, this.memberId, id)
    this.todos[index].isCompleted = !this.todos[index].isCompleted
    this.setState(this.username)
  }

  const onDeleteTodo = async (index) => {
    const id = findTodoIdByStatus(index)
    if (id === null) {
      return
    }
    await api.removeTodo(this.teamId, this.memberId, id)
    this.todos.splice(index, 1)
    this.setState(this.username)
  }

  const onChangeTodo = async (text, index) => {
    const id = findTodoIdByStatus(index)
    if (id === null) {
      return
    }
    await api.changeTodo(this.teamId, this.memberId, id, { contents: text })
    this.todos[index].contents = text
    this.setState(this.username)
  }

  const onChangeTodoPriority = async (index, priority) => {
    const id = findTodoIdByStatus(index)
    if (id === null) {
      return
    }
    await api.changeTodoPriority(teamId, memberId, id, { priority })
    this.todos[index].priority = priority
    this.setState(this.username)
  }

  const onSetTodoStatus = (status) => {
    this.todoViewStatus = status
    this.setState(this.username)
  }

  const onDeleteAll = async () => {
    this.todos = []
    await api.removeAllTodoList(this.teamId, this.memberId)
    this.setState(this.username)
  }

  const filteredTodosByStatus = (status) => {
    const filteredTodos = {
      [todoStatus.ALL]: this.todos,
      [todoStatus.ACTIVE]: this.todos.filter((todo) => !todo.isCompleted),
      [todoStatus.COMPLETED]: this.todos.filter((todo) => todo.isCompleted),
    }

    return filteredTodos[status]
  }

  this.setState = async function (username) {
    this.username = username

    const user = await api.getTodoList(this.teamId, this.memberId)
    if (!user.hasOwnProperty('todoList')) {
      user.todoList = []
    }
    this.todos = user.todoList

    this.filteredTodos = filteredTodosByStatus(this.todoViewStatus)
    this.todoList.setState(this.filteredTodos)
    this.todoCount.setState(this.filteredTodos)
    this.todoStatus.setState(this.todoViewStatus)
  }

  this.init = function () {
    this.teamId = teamId
    this.memberId = memberId
    this.username = username

    this.todos = todoList
    this.filteredTodos = []
    this.todoViewStatus = todoStatus.ALL

    this.$todoInput = $todoInput
    this.$todoList = $todoList
    this.$todoCount = $todoCount
    this.$todoStatus = $todoStatus
    this.$todoDeleteAll = $todoDeleteAll

    try {
      this.todoInput = new TodoInput({
        $target: this.$todoInput,
        onAddTodo,
      })

      this.todoList = new TodoList({
        data: this.todos,
        $target: this.$todoList,
        onToggleTodo,
        onDeleteTodo,
        onChangeTodo,
        onChangeTodoPriority,
      })

      this.todoCount = new TodoCount({
        data: this.todos,
        $target: this.$todoCount,
      })

      this.todoStatus = new TodoStatus({
        $target: this.$todoStatus,
        onSetTodoStatus,
      })

      this.todoDeleteAll = new TodoDeleteAll({
        $target: this.$todoDeleteAll,
        onDeleteAll,
      })
    } catch (err) {
      console.log(err)
    }
    this.setState(this.username)
  }

  this.init()
}
