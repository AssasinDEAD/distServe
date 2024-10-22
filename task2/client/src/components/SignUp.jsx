import React, { useState } from 'react';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation AddUser($name: String!, $password: String!, $age: Int!, $gender: String!) {
              addUser(name: $name, password: $password, age: $age, gender: $gender) {
                id
                name
              }
            }
          `,
          variables: { name: username, password, age: parseInt(age), gender },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setErrorMessage('Ошибка регистрации');
      } else {
        alert('Регистрация успешна!');
      }
    } catch (error) {
      setErrorMessage('Ошибка подключения к серверу');
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <a href="http://127.0.0.1:5173/signup">sign up</a>
      <br/>
      <a href="http://127.0.0.1:5173/signin">sign in</a>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSignUp}>
        <div>
          <label>Имя пользователя</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Возраст</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div>
          <label>Пол</label>
          <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default SignUp;
