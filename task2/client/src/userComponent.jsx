// UserComponent.jsx
import React, { useEffect } from 'react';

const UserComponent = ({ userId }) => {
  useEffect(() => {
    if (!userId) {
      console.error('userId is undefined or null');
      return;
    }

    const fetchUser = async () => {
      const query = `
        query User($userId: ID!) {
          user(id: $userId) {
            name
          }
        }
      `;

      try {
        const response = await fetch('http://localhost:3500/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { userId },
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div>
      <h2>User Information</h2>
      {/* Вывод информации о пользователе, если она будет доступна */}
    </div>
  );
};

export default UserComponent;
