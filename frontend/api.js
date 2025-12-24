const API_URL = 'http://127.0.0.1:8000';

async function makeRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (!response.ok) {
            let errorMessage = `HTTP ошибка! статус: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(err => err.msg).join(', ');
                    } else {
                        errorMessage = errorData.detail;
                    }
                }
            } catch (e) {
                errorMessage = response.statusText;
            }
            throw new Error(errorMessage);
        }
        
        if (response.status === 204) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка API запроса:', error);
        throw error;
    }
}

const api = {
    async getTasks() {
        return await makeRequest('/tasks');
    },
    
    async createTask(taskData) {
        const formattedData = {
            title: taskData.title,
            description: taskData.description || null,
            is_done: taskData.is_done || false
        };
        
        if (taskData.deadline) {
            const date = new Date(taskData.deadline);
            formattedData.deadline = date.toISOString().split('T')[0];
        }
        
        return await makeRequest('/tasks', 'POST', formattedData);
    },
    
    async updateTask(id, taskData) {
        const formattedData = {};
        
        if (taskData.title !== undefined) formattedData.title = taskData.title;
        if (taskData.description !== undefined) formattedData.description = taskData.description;
        if (taskData.is_done !== undefined) formattedData.is_done = taskData.is_done;
        
        if (taskData.deadline !== undefined) {
            if (taskData.deadline) {
                const date = new Date(taskData.deadline);
                formattedData.deadline = date.toISOString().split('T')[0];
            } else {
                formattedData.deadline = null;
            }
        }
        
        return await makeRequest(`/tasks/${id}`, 'PUT', formattedData);
    },
    
    async deleteTask(id) {
        return await makeRequest(`/tasks/${id}`, 'DELETE');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api };
}