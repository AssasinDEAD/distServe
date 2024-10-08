import React, { useState } from 'react';
import { ApolloProvider, useQuery, useMutation, gql } from '@apollo/client';
import { taskClient, userClient } from './apolloClient';

// GraphQL queries
const GET_TASKS_AND_USERS = gql`
  query Tasks {
    tasks {
      description
      user_id
      created_at
      id
    }
    users {
      id
      name
    }
  }
`;

const ADD_TASK = gql`
  mutation AddTask($description: String!, $userId: Int!) {
    addTask(description: $description, userId: $userId) {
      id
      description
      user_id
      created_at
    }
  }
`;

function TaskManager() {
  const { data, loading, error } = useQuery(GET_TASKS_AND_USERS, { client: taskClient });
  const [addTask] = useMutation(ADD_TASK, {
    refetchQueries: [GET_TASKS_AND_USERS], // Обновляем запрос после добавления задачи
  });
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Проверяем на ошибки и загрузку
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Обработка добавления задачи
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (taskDescription && selectedUserId) {
      await addTask({ variables: { description: taskDescription, userId: parseInt(selectedUserId) } });
      setTaskDescription('');
      setSelectedUserId('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>

      {/* Форма для добавления задачи */}
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          required
        />
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
        >
          <option value="">Select User</option>
          {data.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Task</button>
      </form>

      {/* Список задач */}
      <h2>Task List</h2>
      <ul>
        {data.tasks.map((task) => {
          // Находим имя пользователя по user_id
          const user = data.users.find((user) => user.id == task.user_id);
          return (
            <li key={task.id}>
              {task.description} (Assigned to User ID: {task.user_id}, Name: {user ? user.name : 'Unknown User'})
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={taskClient}>
      <TaskManager />
    </ApolloProvider>
  );
}

export default App;
