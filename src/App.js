import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [editing, setEditing] = useState(false)
  const [mutableTodo, setMutableTodo] = useState(initialState)

  useEffect(() => {
    fetchTodos()
  }, [todos,mutableTodo])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }
  function clearInput() {
    setEditing(false)
    setFormState(initialState)
    setMutableTodo(initialState)
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
      console.log(todo);
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function removeTodo(id) {
    // console.log("removed: ",id);
    try {
      const result = await API.graphql(graphqlOperation(deleteTodo,  { input: { id } }));
      console.log("Deleted Todo: ", result);
      const deletedTodoId = result.data.deleteTodo.id;
      console.log("Deleted Todos ID: ", deletedTodoId)
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.log('error deleting todo:', err)
    }
  }

  async function editTodo(todo) {
    try {
      setEditing(true);
      // if (!formState.name || !formState.description) return
      console.log('from editTodo method', todo);
      // setInput(todo);
      setFormState(todo)
      setMutableTodo(todo)
      // setInput('description', todo.description)
      // if (!formState.name || !formState.description) return
      // const todo = { ...formState }
      // setTodos([...todos, todo])  

      // await API.graphql(graphqlOperation(updateTodo, {input: { name: todo.name, description: todo.description, id: todo.id}}))
    } catch (err) {
      console.log('error updating todo:', err)
    }
  }

  async function saveEditedTodo() {
    try {
      console.log('from formState method: ', formState)
      const result = await API.graphql(graphqlOperation(updateTodo, {
        input: { 
          name: formState.name, 
          description: formState.description, 
          id: formState.id,
        },
      })
      );
      console.log("edit mode",result);
      setFormState(initialState);
      setEditing(false);
      setMutableTodo(initialState)

    } catch (err) {
      console.log('error updating todo:', err)
    }
  }

  return (
    <div style={styles.backdrop_continer}>
    <div style={styles.container}>
      <h2>Deron's Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      {editing ? 
      <button style={styles.button} onClick={saveEditedTodo}>Save Todo</button>
      :
      <button style={styles.button} onClick={addTodo}>Create Todo</button>
      }
      <button style={styles.button3} onClick={clearInput}>Clear</button>
      </div>
      <div style={styles.container}>
      <p>I will prevail</p>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
            <button style={styles.button1} onClick={() => removeTodo(todo.id)}>Delete Todo</button>
            <button style={styles.button2} onClick={() => editTodo(todo)}>Update Todo</button>
          </div>
        ))
      }
    <AmplifySignOut />
    </div>
    </div>
  )
}

const styles = {
  container: { backgroundColor: 'skyblue',width: 400, margin: '0 auto', marginBottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  backdrop_continer: { backgroundColor: 'pink',width: 'auto', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button1: { backgroundColor: 'tomato', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' },
  button2: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' },
  button3: { backgroundColor: 'green', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App)