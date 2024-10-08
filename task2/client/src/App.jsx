import React, { useState } from 'react';
import { ApolloProvider, useQuery, useMutation, gql } from '@apollo/client';
import { taskClient, userClient } from './apolloClient';

// GraphQL queries
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`;

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      description
      user_id
      user_name
    }
  }
`;

const ADD_TASK = gql`
  mutation AddTask($description: String!, $userId: Int!) {
    addTask(description: $description, userId: $userId) {
      id
      description
      user_id
      user_name
    }
  }
`;

function TaskManager() {
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch users and tasks
  const { data: usersData, loading: loadingUsers } = useQuery(GET_USERS, { client: userClient });
  const { data: tasksData, loading: loadingTasks } = useQuery(GET_TASKS, { client: taskClient });

  // Add task mutation
  const [addTask] = useMutation(ADD_TASK, { client: taskClient });

  const handleSubmit = async () => {
    if (taskDescription && selectedUserId) {
      await addTask({ variables: { description: taskDescription, userId: selectedUserId } });
      setTaskDescription(''); // Clear input after adding task
      window.location.reload(); // Reload page after adding task
    }
  };

  // Check for data loading
  if (loadingUsers || loadingTasks) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>

      {/* Input for new task */}
      <div>
        <input
          type="text"
          placeholder="Task description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <select onChange={(e) => setSelectedUserId(parseInt(e.target.value))}>
          <option value="">Select user</option>
          {usersData?.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit}>Add Task</button>
      </div>

      {/* List of tasks */}
      <h2>Task List</h2>
      <ul>
        {tasksData?.tasks.map((task) => (
          <li key={task.id}>
            {task.description} (Assigned to User ID: {task.user_id}, Name: {task.user_name || 'Unknown User'})
          </li>
        ))}
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
