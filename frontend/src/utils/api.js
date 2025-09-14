const API_BASE_URL = 'http://localhost:5001/api';

// Create a new user
export const createUser = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user points
export const updateUserPoints = async (email, points) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Deduct coins when starting quiz
export const deductCoins = async (email, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/deduct-coins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deducting coins:', error);
    throw error;
  }
};

// Add coins when completing quiz
export const addCoins = async (email, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/add-coins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding coins:', error);
    throw error;
  }
};

// Get leaderboard data
export const getLeaderboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/leaderboard`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};
