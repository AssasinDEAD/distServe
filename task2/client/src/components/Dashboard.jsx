import React, { useState, useEffect } from 'react';
import keycloak from '../keycloak'; // Импорт Keycloak
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Keycloak instance:', keycloak);
    if (keycloak.token) {
      console.log('Access token:', keycloak.token);  // Access токен
      console.log('Refresh token:', keycloak.refreshToken);  // Refresh токен
    } else {
      console.warn('Keycloak token is not available yet');
    }
    
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3500/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + keycloak.token
        },
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
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + keycloak.token
        },
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
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (keycloak && keycloak.logout) {
        console.log('Keycloak объект:', keycloak);
        console.log('Метод logout:', keycloak.logout);
        
        // Проверка на инициализацию Keycloak
        if (!keycloak.didInitialize) {
          console.log('Keycloak еще не инициализирован, ожидаем...');
          return;
        }

        await keycloak.logout({ redirectUri: window.location.origin + '/signin' });
        navigate('/signin'); // Перенаправляем после выхода
      } else {
        console.error('Keycloak не инициализирован или отсутствует метод logout.');
      }
    } catch (error) {
      console.error('Ошибка при попытке выйти из системы:', error);
    }
  };

  const addTask = async () => {
    if (!taskDescription || !selectedUserId) {
      alert('Пожалуйста, введите задачу и выберите пользователя.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3500/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + keycloak.token
        },
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
            user_id: selectedUserId,
          },
        }),
      });
      const data = await response.json();
      setTasks((prevTasks) => [...prevTasks, data.data.addTask]);
      setTaskDescription('');
      setSelectedUserId(null);
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
      
    } finally {
      console.log('Keycloak instance:', keycloak);
      console.log('Access token:', keycloak.token);  // Access токен
      console.log('Refresh token:', keycloak.refreshToken); 
    }
  };

  return (
    <div>
      <h1>Привет, {keycloak.tokenParsed?.preferred_username}!</h1>
      <a href="http://127.0.0.1:5173/signup">sign up</a>
      <br/>
      <a href="http://127.0.0.1:5173/signin">sign in</a>


      <h2>Управление задачами</h2>

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
          {loadingUsers ? (
            <option>Загрузка пользователей...</option>
          ) : (
            users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))
          )}
        </select>
        <button onClick={addTask}>Добавить задачу</button>
      </div>

      <ul>
        {loadingTasks ? (
          <p>Загрузка задач...</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id}>
              {task.description} (Пользователь: {task.userName})
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
