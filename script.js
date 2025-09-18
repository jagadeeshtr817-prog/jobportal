// API endpoint
const API_URL = 'http://localhost:5000/api';

// Loading state for jobs
let loadingJobs = false;
let jobsData = [];
// Loading and error states
function showLoading() {
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading jobs...</p>
        </div>
    `;
}

function showError(message) {
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = `
        <div class="error">
            <p>❌ ${message}</p>
            <button onclick="fetchJobs()" class="btn btn-primary">Try Again</button>
        </div>
    `;
}

// Function to fetch jobs from the backend
async function fetchJobs() {
    if (loadingJobs) return;
    
    try {
        loadingJobs = true;
        showLoading();
        
        console.log('Fetching jobs...');
        console.log('API URL:', API_URL);
        const response = await fetch(`${API_URL}/jobs`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch jobs: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid data received from server');
        }
        
        jobsData = data;
        renderJobs('');
        
        if (jobsData.length === 0) {
            showNotification('No jobs found in the database', 'info');
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        showError('Failed to load jobs. Please try again.');
        showNotification('Error loading jobs. Please try again later.', 'error');
    } finally {
        loadingJobs = false;
    }
}

// Function to render job cards with enhanced UI and animations
function renderJobs(filter = '') {
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = '';
    
    const filteredJobs = jobsData.filter(job => 
        Object.values(job).some(value => 
            value.toString().toLowerCase().includes(filter.toLowerCase())
        ) ||
        job.skills.some(skill => 
            skill.toLowerCase().includes(filter.toLowerCase())
        )
    );

    // Show message if no jobs found
    if (filteredJobs.length === 0) {
        jobList.innerHTML = `
            <div class="no-results">
                <h3>No matching jobs found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    filteredJobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'card job-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="card-header">
                <h4>${job.title}</h4>
                <span class="company-badge">${job.company}</span>
            </div>
            <div class="card-body">
                <div class="job-info">
                    <span class="location">📍 ${job.location}</span>
                    <span class="job-type">💼 ${job.type}</span>
                    <span class="experience">⏳ ${job.experience}</span>
                    <span class="salary">💰 ${job.salary}</span>
                </div>
                <p class="job-description">${job.description}</p>
                <div class="skills-container">
                    ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary apply-btn" onclick="openApplicationModal('${job._id}', '${job.title}')">
                    Apply Now
                </button>
                <button class="btn btn-secondary save-btn" onclick="saveJob('${job.title}')">
                    Save
                </button>
            </div>
        `;
        
        jobList.appendChild(card);
    });
}

// Modal Functions
function openApplicationModal(jobId, jobTitle) {
    const modal = document.getElementById('applicationModal');
    const titleSpan = document.getElementById('jobTitle');
    const jobIdInput = document.getElementById('jobId');
    titleSpan.textContent = jobTitle;
    jobIdInput.value = jobId;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('applicationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('applicationForm').reset();
}

// Function to handle job application submission
async function submitApplication(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const formData = new FormData(form);
        const jobTitle = document.getElementById('jobTitle').textContent;
        const jobId = document.getElementById('jobId').value;

        const applicationData = {
            jobId,
            jobTitle,
            name: formData.get('name'),
            email: formData.get('email'),
            experience: Number(formData.get('experience')),
            phone: formData.get('phone'),
            noticePeriod: Number(formData.get('noticePeriod')),
            expectedCtc: Number(formData.get('expectedCtc')),
            resumePath: formData.get('resume').name, // In production, handle file upload properly
            coverLetter: formData.get('coverLetter')
        };

        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit application');
        }

        showNotification(`Application submitted for ${jobTitle}! We'll be in touch soon.`, 'success');
        form.reset();
        closeModal();
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Failed to submit application. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
    }
}

// Function to handle job saving
function saveJob(jobTitle) {
    showNotification(`${jobTitle} has been saved to your favorites!`, 'info');
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing job portal...');
    // Add search box with enhanced UI
    const searchBox = document.createElement('div');
    searchBox.className = 'search-container';
    searchBox.innerHTML = `
        <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
                type="text" 
                id="searchInput" 
                class="search-input" 
                placeholder="Search by title, company, skills, or location..."
            >
        </div>
    `;
    
    const jobsSection = document.getElementById('jobs');
    jobsSection.insertBefore(searchBox, jobsSection.children[1]);
    
    // Add search functionality with debounce
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderJobs(e.target.value);
        }, 300);
    });
    
    // Setup modal close button
    document.querySelector('.close-btn').addEventListener('click', closeModal);

    // Setup application form submission
    document.getElementById('applicationForm').addEventListener('submit', submitApplication);

    // Add hidden job ID field to form if it doesn't exist
    if (!document.getElementById('jobId')) {
        const hiddenJobId = document.createElement('input');
        hiddenJobId.type = 'hidden';
        hiddenJobId.id = 'jobId';
        hiddenJobId.name = 'jobId';
        document.getElementById('applicationForm').appendChild(hiddenJobId);
    }
    
    // Add smooth scroll functionality
    document.querySelectorAll('a[href^="#"], .btn').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href')?.startsWith('#') || this.onclick) {
                e.preventDefault();
                const targetId = this.getAttribute('href') || '#jobs';
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add scroll animations using Intersection Observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1 }
    );
    
    document.querySelectorAll('.section, .card').forEach(el => {
        observer.observe(el);
    });

    // Initial fetch
    fetchJobs();
});