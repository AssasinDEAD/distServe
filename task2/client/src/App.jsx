import React, { useState, useEffect } from 'react';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получение всех задач
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3500/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                tasks {
                  id
                  description
                  user_id
                  userName
                }
              }
            `,
          }),
        });
        const data = await response.json();
        setTasks(data.data.tasks);
      } catch (error) {
        console.error('Ошибка при получении задач:', error);
      }
    };

    // Получение всех пользователей
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                users {
                  id
                  name
                }
              }
            `,
          }),
        });
        const data = await response.json();
        setUsers(data.data.users);
      } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
      }
    };

    fetchTasks();
    fetchUsers();
    setLoading(false);
  }, []);

  const addTask = async () => {
    if (!taskDescription || !selectedUserId) {
      alert('Пожалуйста, введите задачу и выберите пользователя.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3500/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation AddTask($description: String!, $user_id: Int!) {
            addTask(description: $description, user_id: $user_id) {
              id
              description
              user_id
              userName
            }
          }`,
          variables: {
            description: taskDescription,
            user_id: selectedUserId, // Используем user_id
          },
        }),
      });
      const data = await response.json();
      setTasks((prevTasks) => [...prevTasks, data.data.addTask]);
      setTaskDescription('');
      setSelectedUserId(null);
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
    }
  };

  return (
    <div>
      <h1>Управление задачами</h1>

      {/* Форма добавления задачи */}
      <div>
        <input
          type="text"
          placeholder="Введите описание задачи"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <select
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value, 10))}
        >
          <option value="">Выберите пользователя</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button onClick={addTask}>Добавить задачу</button>
      </div>

      {/* Вывод задач */}
      {loading ? (
        <p>Загрузка данных...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.description} (Пользователь: {task.userName})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
