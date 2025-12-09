
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export interface Entity {
  id: number;
  name: string;
}

// Define the structure for creating a new entity
export interface EntityCreate {
  name: string;
}



const fetchEntities = async (endpoint: string): Promise<Entity[]> => {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
};

const createEntity = async (endpoint: string, data: EntityCreate): Promise<Entity> => {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (response.status === 400) {
    // Handle 'already exists' error
    const errorBody = await response.json();
    throw new Error(errorBody.detail || 'Entity already exists.');
  }
  if (!response.ok) {
    throw new Error(`Failed to create ${endpoint}`);
  }
  return response.json();
};

// --- Specific API functions ---

export const getSkills = () => fetchEntities('skills');
export const createSkill = (data: EntityCreate) => createEntity('skills', data);

export const getDepartments = () => fetchEntities('departments');
export const createDepartment = (data: EntityCreate) => createEntity('departments', data);

export const getLocations = () => fetchEntities('locations');
export const createLocation = (data: EntityCreate) => createEntity('locations', data);