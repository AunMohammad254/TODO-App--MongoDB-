class TaskManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.tasks = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = {
            status: '',
            priority: '',
            search: '',
            sortBy: 'createdAt'
        };
        this.editingTask = null;
        
        // Configure API base URL based on environment
        this.apiBaseUrl = this.getApiBaseUrl();
        
        this.init();
    }
    
    getApiBaseUrl() {
        // Check if we're running in Electron with file:// protocol
        // Check if we're running in Electron with file:// protocol or on localhost
        if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
            // In production Electron app or local development, use localhost
            return 'http://localhost:3000';
        } else {
            // In deployed web browser, use relative URLs
            return '';
        }
    }

    init() {
        this.bindEvents();
        
        if (this.token) {
            this.showMainScreen();
            this.loadUserProfile();
            this.loadTasks();
            this.loadStats();
        } else {
            this.showLoginScreen();
        }
    }

    bindEvents() {
        // Screen navigation
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterScreen();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreen();
        });

        // Forms
        // Password Toggle Functionality
        const togglePasswordVisibility = (passwordFieldId, toggleButtonId) => {
            const passwordField = document.getElementById(passwordFieldId);
            const toggleButton = document.getElementById(toggleButtonId);

            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordField.setAttribute('type', type);
                    toggleButton.innerHTML = type === 'password' ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
                });
            }
        };

        togglePasswordVisibility('password', 'togglePassword');
        togglePasswordVisibility('regPassword', 'toggleRegPassword');

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSave();
        });

        // Buttons
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('newTaskBtn').addEventListener('click', () => {
            this.showTaskModal();
        });

        document.getElementById('cancelTask').addEventListener('click', () => {
            this.hideTaskModal();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.hideTaskModal();
        });

        // Filters and search
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.loadTasks();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.loadTasks();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.debounce(() => this.loadTasks(), 300)();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.loadTasks();
        });

        // Modal backdrop click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.hideTaskModal();
            }
        });

        // Event delegation for task list
        document.getElementById('taskList').addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const taskId = target.dataset.taskId;

            if (action === 'edit-task' && taskId) {
                const task = this.tasks.find(t => t._id === taskId);
                if (task) {
                    this.showTaskModal(task);
                }
            } else if (action === 'delete-task' && taskId) {
                this.deleteTask(taskId);
            }
        });

        // Event delegation for pagination
        document.getElementById('pagination').addEventListener('click', (e) => {
            const target = e.target.closest('[data-action="goto-page"]');
            if (!target) return;

            const page = parseInt(target.dataset.page);
            if (page && page !== this.currentPage) {
                this.goToPage(page);
            }
        });
    }

    // Authentication Methods
    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showMainScreen();
                this.loadTasks();
                this.loadStats();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showMainScreen();
                this.loadTasks();
                this.loadStats();
                this.showNotification('Registration successful!', 'success');
            } else {
                const errors = data.errors ? data.errors.map(e => e.msg).join(', ') : data.error;
                this.showNotification(errors || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    async loadUserProfile() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                document.getElementById('welcomeUser').textContent = `Welcome, ${this.currentUser.username}!`;
            } else if (response.status === 401) {
                this.handleLogout();
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        this.token = null;
        this.currentUser = null;
        this.tasks = [];
        this.showLoginScreen();
        this.showNotification('Logged out successfully', 'info');
    }

    // Task Methods
    async loadTasks() {
        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                sortBy: this.filters.sortBy,
                sortOrder: 'desc'
            });

            if (this.filters.status) queryParams.append('status', this.filters.status);
            if (this.filters.priority) queryParams.append('priority', this.filters.priority);
            if (this.filters.search) queryParams.append('search', this.filters.search);

            const response = await fetch(`${this.apiBaseUrl}/api/tasks?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.tasks = data.tasks;
                this.totalPages = data.pagination.pages;
                this.renderTasks();
                this.renderPagination();
                this.loadStats(); // Update stats when tasks change
            } else if (response.status === 401) {
                this.handleLogout();
            } else {
                this.showNotification('Failed to load tasks', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    async loadStats() {
        try {
            const queryParams = new URLSearchParams();
            if (this.filters.status) queryParams.append('status', this.filters.status);
            if (this.filters.priority) queryParams.append('priority', this.filters.priority);
            if (this.filters.search) queryParams.append('search', this.filters.search);

            const url = queryParams.toString() ? 
                `${this.apiBaseUrl}/api/tasks/stats?${queryParams}` : 
                `${this.apiBaseUrl}/api/tasks/stats`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderStats(data);
            } else if (response.status === 401) {
                this.handleLogout();
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async handleTaskSave() {
        const taskId = document.getElementById('taskId').value;
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value || undefined
        };

        try {
            const url = taskId ? `${this.apiBaseUrl}/api/tasks/${taskId}` : `${this.apiBaseUrl}/api/tasks`;
            const method = taskId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(taskData)
            });

            const data = await response.json();

            if (response.ok) {
                this.hideTaskModal();
                this.loadTasks();
                this.loadStats();
                this.showNotification(
                    taskId ? 'Task updated successfully!' : 'Task created successfully!',
                    'success'
                );
            } else {
                const errors = data.errors ? data.errors.map(e => e.msg).join(', ') : data.error;
                this.showNotification(errors || 'Failed to save task', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.loadTasks();
                this.loadStats();
                this.showNotification('Task deleted successfully!', 'success');
            } else {
                this.showNotification('Failed to delete task', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    // UI Methods
    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.add('hidden');
    }

    showRegisterScreen() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.remove('hidden');
        document.getElementById('mainScreen').classList.add('hidden');
    }

    showMainScreen() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');
    }

    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskId').value = task._id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskDueDate').value = task.dueDate ? 
                new Date(task.dueDate).toISOString().slice(0, 16) : '';
        } else {
            title.textContent = 'Add New Task';
            document.getElementById('taskForm').reset();
            document.getElementById('taskId').value = '';
        }
        
        modal.classList.remove('hidden');
        document.getElementById('taskTitle').focus();
    }

    hideTaskModal() {
        document.getElementById('taskModal').classList.add('hidden');
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>Create your first task to get started!</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = this.tasks.map(task => `
            <div class="task-item" data-task-id="${task._id}" data-action="edit-task">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-actions">
                        <button class="edit-btn" data-task-id="${task._id}" data-action="edit-task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-task-id="${task._id}" data-action="delete-task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="task-meta">
                    <span class="priority ${task.priority}">${task.priority}</span>
                    <span class="status ${task.status.replace(' ', '')}">${task.status}</span>
                </div>
                
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                
                <div class="task-dates">
                    <div>Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                    ${task.dueDate ? `<div>Due: ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        // Previous button
        if (this.currentPage > 1) {
            html += `<button data-page="${this.currentPage - 1}" data-action="goto-page">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === this.currentPage) {
                html += `<button class="active">${i}</button>`;
            } else {
                html += `<button data-page="${i}" data-action="goto-page">${i}</button>`;
            }
        }

        // Next button
        if (this.currentPage < this.totalPages) {
            html += `<button data-page="${this.currentPage + 1}" data-action="goto-page">Next</button>`;
        }

        pagination.innerHTML = html;
    }

    renderStats(data) {
        const statsContainer = document.getElementById('taskStats');
        
        // Calculate completion rate
        const completedTasks = data.statusStats.find(stat => stat._id === 'Completed')?.count || 0;
        const completionRate = data.total > 0 ? Math.round((completedTasks / data.total) * 100) : 0;
        
        let html = `
            <div class="stats-header">
                <h3><i class="fas fa-chart-pie"></i> Task Statistics</h3>
                <button class="stats-expand-btn" data-action="toggle-stats-popup">
                    <i class="fas fa-expand-alt"></i>
                </button>
            </div>
            
            <div class="stats-summary">
                <div class="stat-card total-tasks">
                    <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                    <div class="stat-content">
                        <div class="stat-number">${data.total}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                </div>
                
                <div class="stat-card completion-rate">
                    <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                    <div class="stat-content">
                        <div class="stat-number">${completionRate}%</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
            </div>
            
            <div class="stats-details">
                <div class="stats-section">
                    <h4><i class="fas fa-flag"></i> By Status</h4>
                    <div class="stats-grid">
        `;
        
        // Status statistics
        const statusOrder = ['Pending', 'In Progress', 'Completed'];
        const statusIcons = {
            'Pending': 'fas fa-clock',
            'In Progress': 'fas fa-spinner',
            'Completed': 'fas fa-check-circle'
        };
        
        statusOrder.forEach(status => {
            const stat = data.statusStats.find(s => s._id === status);
            const count = stat ? stat.count : 0;
            const percentage = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
            
            html += `
                <div class="stat-item ${status.toLowerCase().replace(' ', '-')}">
                    <div class="stat-item-icon"><i class="${statusIcons[status]}"></i></div>
                    <div class="stat-item-content">
                        <div class="stat-item-number">${count}</div>
                        <div class="stat-item-label">${status}</div>
                        <div class="stat-item-bar">
                            <div class="stat-item-progress" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="stats-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> By Priority</h4>
                    <div class="stats-grid">
        `;
        
        // Priority statistics
        const priorityOrder = ['high', 'medium', 'low'];
        const priorityIcons = {
            'high': 'fas fa-arrow-up',
            'medium': 'fas fa-minus',
            'low': 'fas fa-arrow-down'
        };
        
        priorityOrder.forEach(priority => {
            const stat = data.priorityStats.find(s => s._id === priority);
            const count = stat ? stat.count : 0;
            const percentage = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
            
            html += `
                <div class="stat-item priority-${priority}">
                    <div class="stat-item-icon"><i class="${priorityIcons[priority]}"></i></div>
                    <div class="stat-item-content">
                        <div class="stat-item-number">${count}</div>
                        <div class="stat-item-label">${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
                        <div class="stat-item-bar">
                            <div class="stat-item-progress" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;

        statsContainer.innerHTML = html;
        
        // Add event listener for popup toggle
        const expandBtn = statsContainer.querySelector('[data-action="toggle-stats-popup"]');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.toggleStatsPopup(data));
        }
    }

    toggleStatsPopup(data) {
        // Check if popup already exists
        let popup = document.getElementById('statsPopup');
        
        if (popup) {
            // Close existing popup
            popup.remove();
            return;
        }
        
        // Create popup
        popup = document.createElement('div');
        popup.id = 'statsPopup';
        popup.className = 'stats-popup';
        
        const completedTasks = data.statusStats.find(stat => stat._id === 'Completed')?.count || 0;
        const completionRate = data.total > 0 ? Math.round((completedTasks / data.total) * 100) : 0;
        
        popup.innerHTML = `
            <div class="stats-popup-content">
                <div class="stats-popup-header">
                    <h2><i class="fas fa-chart-bar"></i> Detailed Task Statistics</h2>
                    <button class="stats-popup-close" data-action="close-stats-popup">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="stats-popup-body">
                    <div class="stats-overview">
                        <div class="overview-card">
                            <div class="overview-icon"><i class="fas fa-tasks"></i></div>
                            <div class="overview-content">
                                <div class="overview-number">${data.total}</div>
                                <div class="overview-label">Total Tasks</div>
                            </div>
                        </div>
                        
                        <div class="overview-card">
                            <div class="overview-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="overview-content">
                                <div class="overview-number">${completedTasks}</div>
                                <div class="overview-label">Completed</div>
                            </div>
                        </div>
                        
                        <div class="overview-card">
                            <div class="overview-icon"><i class="fas fa-percentage"></i></div>
                            <div class="overview-content">
                                <div class="overview-number">${completionRate}%</div>
                                <div class="overview-label">Success Rate</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-charts">
                        <div class="chart-section">
                            <h3><i class="fas fa-flag"></i> Status Distribution</h3>
                            <div class="chart-items">
                                ${this.generateStatusChart(data.statusStats, data.total)}
                            </div>
                        </div>
                        
                        <div class="chart-section">
                            <h3><i class="fas fa-exclamation-triangle"></i> Priority Distribution</h3>
                            <div class="chart-items">
                                ${this.generatePriorityChart(data.priorityStats, data.total)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="stats-popup-backdrop" data-action="close-stats-popup"></div>
        `;
        
        document.body.appendChild(popup);
        
        // Add event listeners
        popup.querySelectorAll('[data-action="close-stats-popup"]').forEach(btn => {
            btn.addEventListener('click', () => popup.remove());
        });
        
        // Animate in
        setTimeout(() => popup.classList.add('active'), 10);
    }
    
    generateStatusChart(statusStats, total) {
        const statusOrder = ['Pending', 'In Progress', 'Completed'];
        const statusColors = {
            'Pending': '#fbbf24',
            'In Progress': '#3b82f6',
            'Completed': '#10b981'
        };
        
        return statusOrder.map(status => {
            const stat = statusStats.find(s => s._id === status);
            const count = stat ? stat.count : 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            
            return `
                <div class="chart-item">
                    <div class="chart-item-label">${status}</div>
                    <div class="chart-item-bar">
                        <div class="chart-item-fill" style="width: ${percentage}%; background-color: ${statusColors[status]}"></div>
                    </div>
                    <div class="chart-item-value">${count} (${percentage}%)</div>
                </div>
            `;
        }).join('');
    }
    
    generatePriorityChart(priorityStats, total) {
        const priorityOrder = ['high', 'medium', 'low'];
        const priorityColors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#6b7280'
        };
        
        return priorityOrder.map(priority => {
            const stat = priorityStats.find(s => s._id === priority);
            const count = stat ? stat.count : 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            
            return `
                <div class="chart-item">
                    <div class="chart-item-label">${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
                    <div class="chart-item-bar">
                        <div class="chart-item-fill" style="width: ${percentage}%; background-color: ${priorityColors[priority]}"></div>
                    </div>
                    <div class="chart-item-value">${count} (${percentage}%)</div>
                </div>
            `;
        }).join('');
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadTasks();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f39c12';
                break;
            default:
                notification.style.backgroundColor = '#3498db';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application
const taskManager = new TaskManager();