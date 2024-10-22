import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation SignIn($name: String!, $password: String!) {
              signIn(name: $name, password: $password)
            }
          `,
          variables: { name: username, password },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setErrorMessage('Ошибка входа');
      } else {
        alert(result.data.signIn);  // Выведет сообщение "Successfully signed in!"
        navigate('/dashboard');  // Переход на защищенную страницу после входа
      }
    } catch (error) {
      setErrorMessage('Ошибка подключения к серверу');
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <a href="http://127.0.0.1:5173/signup">sign up</a>
      <br/>
      <a href="http://127.0.0.1:5173/signin">sign in</a>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label>Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default SignIn;
