import axios from 'axios'
const api = axios.create({
baseURL: import.meta.env.VITE_SUPABASE_URL + '/rest/v1',
headers: {
'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
'Content-Type': 'application/json'
}
})
export default api
export const getTasks = () => api.get('/tasks')
export const createTask = (task) => api.post('/tasks', task)
export const updateTask = (id, data) => api.patch(`/tasks?id=eq.${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks?id=eq.${id}`)