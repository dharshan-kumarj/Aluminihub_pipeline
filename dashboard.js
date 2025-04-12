// Dashboard JavaScript - Real-time functionality

// Current user information
const currentUser = {
    username: 'dharshan-kumarj',
    fullName: 'Dharshan Kumar',
    role: 'Administrator',
    avatar: `https://ui-avatars.com/api/?name=Dharshan+Kumar&background=0D8ABC&color=fff`
};

// ============ Clock & User Info ============
function initializeDashboard() {
    // Set user information
    document.querySelector('.user-name').textContent = currentUser.fullName;
    document.querySelector('.user-info img').src = currentUser.avatar;
    
    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set up event listeners
    document.querySelector('.refresh-btn').addEventListener('click', refreshDashboard);
    
    // Load initial data
    loadETLLogs();
    loadCSVFiles();
    updateMetrics();
}

function updateClock() {
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    document.querySelector('.date-time').textContent = formattedDate;
}

// ============ Dashboard Data Refresh ============
function refreshDashboard() {
    // Show loading indicator
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate data loading (would be API calls in production)
    Promise.all([
        loadETLLogs(),
        loadCSVFiles(),
        updateMetrics()
    ]).then(() => {
        // Restore button state
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            // Show success notification
            showNotification('Dashboard refreshed successfully!');
        }, 1000);
    }).catch(error => {
        console.error('Error refreshing dashboard:', error);
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        showNotification('Failed to refresh dashboard', 'error');
    });
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============ ETL Logs Loading ============
function loadETLLogs() {
    return new Promise((resolve) => {
        // In production, this would be an API call to fetch logs
        setTimeout(() => {
            const logs = mockETLLogs();
            updateLogsTable(logs);
            resolve(logs);
        }, 500);
    });
}

function updateLogsTable(logs) {
    const tableBody = document.querySelector('.logs-table tbody');
    tableBody.innerHTML = '';
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        // Determine status badge class
        let statusClass = 'success';
        if (log.message.includes('Error') || log.level === 'ERROR') {
            statusClass = 'error';
        } else if (log.message.includes('No new registrations')) {
            statusClass = 'warning';
        }
        
        // Determine log level class
        const levelClass = log.level.toLowerCase();
        
        row.innerHTML = `
            <td>${log.timestamp}</td>
            <td><span class="log-level ${levelClass}">${log.level}</span></td>
            <td>${log.message}</td>
            <td><span class="status-badge ${statusClass}">${log.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ============ CSV Files Loading ============
function loadCSVFiles() {
    return new Promise((resolve) => {
        // In production, this would be an API call to fetch file data
        setTimeout(() => {
            const files = mockCSVFiles();
            updateFilesContainer(files);
            resolve(files);
        }, 700);
    });
}

function updateFilesContainer(files) {
    const filesContainer = document.querySelector('.files-container');
    filesContainer.innerHTML = '';
    
    files.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        fileCard.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-file-csv"></i>
            </div>
            <div class="file-details">
                <h4>${file.filename}</h4>
                <p>Created: ${file.created}</p>
                <p>Size: ${file.size}</p>
                <p>Records: ${file.records}</p>
            </div>
            <div class="file-actions">
                <button class="file-btn download" title="Download"><i class="fas fa-download"></i></button>
                <button class="file-btn view" title="View"><i class="fas fa-eye"></i></button>
                <button class="file-btn email" title="Email"><i class="fas fa-envelope"></i></button>
            </div>
        `;
        
        filesContainer.appendChild(fileCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.file-btn.download').forEach(btn => {
        btn.addEventListener('click', function() {
            const filename = this.closest('.file-card').querySelector('h4').textContent;
            showNotification(`Downloading ${filename}`);
        });
    });
    
    document.querySelectorAll('.file-btn.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const filename = this.closest('.file-card').querySelector('h4').textContent;
            showNotification(`Viewing ${filename}`);
        });
    });
    
    document.querySelectorAll('.file-btn.email').forEach(btn => {
        btn.addEventListener('click', function() {
            const filename = this.closest('.file-card').querySelector('h4').textContent;
            showNotification(`Sending ${filename} via email`);
        });
    });
}

// ============ Metrics Update ============
function updateMetrics() {
    return new Promise((resolve) => {
        // In production, this would be an API call to fetch metrics
        setTimeout(() => {
            const metrics = mockMetrics();
            
            // Update the metrics display
            document.querySelectorAll('.metric-card').forEach((card, index) => {
                const metric = Object.values(metrics)[index];
                if (metric) {
                    card.querySelector('.metric-value').textContent = metric.value;
                    
                    const changeElement = card.querySelector('.metric-change');
                    changeElement.textContent = metric.change;
                    
                    if (metric.isPositive) {
                        changeElement.classList.add('positive');
                        changeElement.classList.remove('negative');
                    } else {
                        changeElement.classList.add('negative');
                        changeElement.classList.remove('positive');
                    }
                }
            });
            
            resolve(metrics);
        }, 600);
    });
}

// ============ Mock Data Functions ============
function mockETLLogs() {
    const now = new Date();
    
    // Create timestamps with proper decreasing order
    const timestamps = [];
    for (let i = 0; i < 6; i++) {
        const logTime = new Date(now - (i * 5 * 60 * 1000)); // 5 minutes apart
        timestamps.push(logTime.toISOString().replace('T', ' ').substring(0, 19));
    }
    
    return [
        {
            timestamp: timestamps[0],
            level: 'INFO',
            message: 'Starting ETL process',
            status: 'Completed'
        },
        {
            timestamp: timestamps[0],
            level: 'INFO',
            message: `Fetched 12 alumni registrations from the last 10 hours`,
            status: 'Completed'
        },
        {
            timestamp: timestamps[0],
            level: 'INFO',
            message: `Successfully saved 12 registrations to alumni_data/alumni_registrations_${timestamps[0].replace(/[^0-9]/g, '').substring(0, 8)}_${timestamps[0].replace(/[^0-9]/g, '').substring(8, 14)}.csv`,
            status: 'Completed'
        },
        {
            timestamp: timestamps[0],
            level: 'INFO',
            message: 'Email sent to admin@college.edu with CSV attachment',
            status: 'Delivered'
        },
        {
            timestamp: timestamps[1],
            level: 'ERROR',
            message: 'Error sending email: Connection timed out',
            status: 'Failed'
        },
        {
            timestamp: timestamps[2],
            level: 'INFO',
            message: 'ETL process completed: No new registrations found',
            status: 'No Data'
        }
    ];
}

function mockCSVFiles() {
    const now = new Date();
    
    // Create timestamps with proper decreasing order
    const timestamps = [];
    for (let i = 0; i < 3; i++) {
        const fileTime = new Date(now - (i * 30 * 60 * 1000)); // 30 minutes apart
        timestamps.push(fileTime.toISOString().replace('T', ' ').substring(0, 19));
    }
    
    return [
        {
            filename: `alumni_registrations_${timestamps[0].replace(/[^0-9]/g, '').substring(0, 8)}_${timestamps[0].replace(/[^0-9]/g, '').substring(8, 14)}.csv`,
            created: timestamps[0],
            size: '4.2 KB',
            records: 12
        },
        {
            filename: `alumni_registrations_${timestamps[1].replace(/[^0-9]/g, '').substring(0, 8)}_${timestamps[1].replace(/[^0-9]/g, '').substring(8, 14)}.csv`,
            created: timestamps[1],
            size: '3.7 KB',
            records: 9
        },
        {
            filename: `alumni_registrations_${timestamps[2].replace(/[^0-9]/g, '').substring(0, 8)}_${timestamps[2].replace(/[^0-9]/g, '').substring(8, 14)}.csv`,
            created: timestamps[2],
            size: '5.1 KB',
            records: 15
        }
    ];
}

function mockMetrics() {
    return {
        dataExtractions: {
            value: '4',
            change: '+12% from last week',
            isPositive: true
        },
        emailsSent: {
            value: '2',
            change: '+8% from last week',
            isPositive: true
        },
        alumniProcessed: {
            value: '4',
            change: '+23% from last week',
            isPositive: true
        },
        errors: {
            value: '7',
            change: '+2 from last week',
            isPositive: false
        }
    };
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);