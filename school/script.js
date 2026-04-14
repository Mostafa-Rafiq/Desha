// Fake Data
const appData = {
    student: {
        name: "Lydia Peterson",
        class: "10th Grade - Section B",
        id: "STD-2023-8902",
        overallAttendance: 92,
        gpa: 3.8
    },
    notifications: [
        { id: 1, title: "Math Assignment Graded", time: "10 mins ago", icon: "fa-check", type: "success" },
        { id: 2, title: "Parent-Teacher Meeting", time: "2 days ago", icon: "fa-users", type: "primary" },
        { id: 3, title: "Science Project Due", time: "3 days ago", icon: "fa-exclamation", type: "warning" }
    ],
    latestGrades: [
        { subject: "Mathematics", assessment: "Midterm Exam", date: "Oct 12, 2023", grade: "A-", score: 92 },
        { subject: "Physics", assessment: "Lab Report", date: "Oct 10, 2023", grade: "B+", score: 88 },
        { subject: "Literature", assessment: "Essay", date: "Oct 05, 2023", grade: "A", score: 95 }
    ],
    todo: [
        { id: 1, task: "Sign Permission Slip", due: "Tomorrow", subject: "Administration" },
        { id: 2, task: "Review History Draft", due: "Oct 18, 2023", subject: "History" }
    ],
    attendanceDays: [
        { date: "Oct 14, 2023", day: "Monday", status: "Present", remarks: "-" },
        { date: "Oct 13, 2023", day: "Friday", status: "Present", remarks: "-" },
        { date: "Oct 12, 2023", day: "Thursday", status: "Absent", remarks: "Doctor Appointment" },
        { date: "Oct 11, 2023", day: "Wednesday", status: "Present", remarks: "-" },
        { date: "Oct 10, 2023", day: "Tuesday", status: "Present", remarks: "-" }
    ],
    gradesSummary: {
        labels: ["Math", "Physics", "Chemistry", "Biology", "Literature", "History"],
        data: [92, 88, 85, 90, 95, 89]
    },
    assignments: [
        { id: 1, title: "Algebra Worksheet", subject: "Mathematics", due: "Oct 15, 2023", status: "pending" },
        { id: 2, title: "Cell Structure Model", subject: "Biology", due: "Oct 16, 2023", status: "pending" },
        { id: 3, title: "The Great Gatsby Essay", subject: "Literature", due: "Oct 10, 2023", status: "completed" },
        { id: 4, title: "World War II Timeline", subject: "History", due: "Oct 08, 2023", status: "completed" }
    ],
    contacts: [
        { id: "c1", name: "Mr. Smith", subject: "Math Teacher", initial: "S", online: true },
        { id: "c2", name: "Mrs. Davis", subject: "Science Teacher", initial: "D", online: false },
        { id: "c3", name: "Mr. Johnson", subject: "Principal", initial: "J", online: false }
    ],
    chatHistory: [
        { sender: "Mr. Smith", type: "receiver", time: "09:41 AM", text: "Hello! Lydia has been doing great in algebra lately." },
        { sender: "Parent User", type: "sender", time: "10:15 AM", text: "That's wonderful to hear. Is there anything specific she should practice at home?" },
        { sender: "Mr. Smith", type: "receiver", time: "10:20 AM", text: "Just keep reviewing the quadratic equations worksheet I sent home. She's got the basics down perfectly." }
    ]
};

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const closeSidebar = document.getElementById('closeSidebar');

    sidebarCollapse.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        content.classList.toggle('active');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        if(window.innerWidth <= 768) {
            content.classList.remove('active');
        } else {
            content.classList.add('active');
        }
    });

    // Handle responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('active'); // hide
            content.classList.add('active'); // expand
        } else {
            sidebar.classList.remove('active'); // show
            content.classList.remove('active'); // reset
        }
    });
    // Trigger initial resize logic
    window.dispatchEvent(new Event('resize'));

    // 2. Navigation Logic (SPA)
    const navLinks = document.querySelectorAll('#sidebar ul li a');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            // Update Active Link State
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');

            // Hide all sections, show target
            sections.forEach(sec => {
                sec.classList.add('d-none');
                sec.classList.remove('active-section');
            });
            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('d-none');
            
            // Re-trigger animation
            targetSection.classList.remove('fade-in');
            void targetSection.offsetWidth; // trigger reflow
            targetSection.classList.add('fade-in');

            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                sidebar.classList.add('active');
            }

            // Render chart if grades section is clicked and chart not rendered yet
            if (targetId === 'grades-section' && !window.chartRendered) {
                renderGradesChart();
                window.chartRendered = true;
            }
        });
    });

    // 3. Populate Data
    populateDashboard();
    populateNotifications();
    populateAttendance();
    populateAssignments();
    populateMessages();

    // 4. Assignments Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => {
                b.classList.remove('btn-primary', 'text-white');
                b.classList.add('btn-light', 'text-secondary');
            });
            btn.classList.remove('btn-light', 'text-secondary');
            btn.classList.add('btn-primary', 'text-white');
            
            const filter = btn.getAttribute('data-filter');
            populateAssignments(filter);
        });
    });

    // 5. Chat form submission
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if(!text) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble sender`;
        bubble.innerHTML = `
            ${text}
            <div class="small mt-1 text-white-50 text-end" style="font-size: 0.7rem;">${timeStr}</div>
        `;
        chatMessages.appendChild(bubble);
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});

// Functions to populate UI
function populateDashboard() {
    // Student Info
    document.getElementById('student-name').textContent = appData.student.name;
    document.getElementById('student-class').textContent = appData.student.class;
    document.getElementById('student-id').textContent = appData.student.id;
    
    // Attendance & GPA
    document.getElementById('overall-attendance').textContent = appData.student.overallAttendance + '%';
    document.getElementById('attendance-bar').style.width = appData.student.overallAttendance + '%';
    document.getElementById('overall-gpa').textContent = appData.student.gpa.toFixed(1);

    // Latest Grades
    const gradesBody = document.getElementById('latest-grades-body');
    appData.latestGrades.forEach(grade => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center me-3 small fw-bold">
                        ${grade.subject.charAt(0)}
                    </div>
                    <span class="fw-medium">${grade.subject}</span>
                </div>
            </td>
            <td><span class="text-secondary small">${grade.assessment}</span></td>
            <td><span class="text-secondary small">${grade.date}</span></td>
            <td class="text-end fw-bold text-dark">${grade.grade} <span class="small text-muted fw-normal">(${grade.score}%)</span></td>
        `;
        gradesBody.appendChild(tr);
    });

    // Todo List
    const todoList = document.getElementById('todo-list');
    appData.todo.forEach(t => {
        const item = document.createElement('div');
        item.className = 'd-flex align-items-start mb-3 pb-3 border-bottom';
        item.innerHTML = `
            <div class="form-check mt-1 me-3">
                <input class="form-check-input" type="checkbox" value="" id="todo-${t.id}">
            </div>
            <div>
                <label class="form-check-label fw-medium text-dark d-block mb-1" for="todo-${t.id}">
                    ${t.task}
                </label>
                <div class="d-flex align-items-center small text-secondary">
                    <i class="far fa-clock me-1"></i> ${t.due}
                    <span class="mx-2">•</span>
                    ${t.subject}
                </div>
            </div>
        `;
        todoList.appendChild(item);
    });
}

function populateNotifications() {
    const list = document.getElementById('notifications-list');
    document.getElementById('notif-count').textContent = appData.notifications.length;
    
    appData.notifications.forEach(notif => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a class="dropdown-item py-3 border-bottom notification-item d-flex align-items-start px-3" href="#">
                <div class="notification-icon bg-${notif.type}-soft text-${notif.type} me-3 flex-shrink-0">
                    <i class="fas ${notif.icon}"></i>
                </div>
                <div>
                    <p class="mb-1 fw-medium text-dark lh-sm">${notif.title}</p>
                    <small class="text-muted"><i class="far fa-clock me-1"></i>${notif.time}</small>
                </div>
            </a>
        `;
        list.appendChild(li);
    });
    const viewAll = document.createElement('li');
    viewAll.innerHTML = `<a class="dropdown-item text-center py-2 text-primary fw-medium" href="#">View all notifications</a>`;
    list.appendChild(viewAll);
}

function populateAttendance() {
    document.getElementById('att-page-percentage').textContent = appData.student.overallAttendance + '%';
    const tbody = document.getElementById('attendance-body');
    tbody.innerHTML = '';
    
    appData.attendanceDays.forEach(day => {
        const isAbsent = day.status.toLowerCase() === 'absent';
        const badgeClass = isAbsent ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success';
        const iconClass = isAbsent ? 'fa-times-circle' : 'fa-check-circle';
        
        const tr = document.createElement('tr');
        if(isAbsent) tr.classList.add('bg-danger-soft', 'bg-opacity-10'); // subtle highlight
        
        tr.innerHTML = `
            <td class="fw-medium">${day.date}</td>
            <td class="text-secondary">${day.day}</td>
            <td><span class="badge ${badgeClass} rounded-pill px-3 py-2 border border-white"><i class="fas ${iconClass} me-1"></i>${day.status}</span></td>
            <td class="text-secondary small">${day.remarks}</td>
        `;
        tbody.appendChild(tr);
    });
}

function populateAssignments(filter = 'all') {
    const list = document.getElementById('assignments-list');
    list.innerHTML = '';
    
    appData.assignments.forEach(assign => {
        if (filter !== 'all' && assign.status !== filter) return;
        
        const isPending = assign.status === 'pending';
        const statusBadge = isPending ? 
            `<span class="badge bg-warning-soft text-warning rounded-pill px-3 py-2"><i class="fas fa-hourglass-half me-1"></i>Pending</span>` :
            `<span class="badge bg-success-soft text-success rounded-pill px-3 py-2"><i class="fas fa-check-circle me-1"></i>Completed</span>`;
            
        const div = document.createElement('div');
        div.className = 'col-12 col-md-6 col-xl-4';
        div.innerHTML = `
            <div class="card border-0 glass-card h-100">
                <div class="card-body p-4 position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="text-primary fw-medium small text-uppercase tracking-wide">${assign.subject}</span>
                        ${statusBadge}
                    </div>
                    <h5 class="fw-bold mb-3">${assign.title}</h5>
                    <div class="d-flex border-top pt-3 mt-auto justify-content-between align-items-center">
                        <span class="text-secondary small"><i class="far fa-calendar-alt me-1"></i>Due: ${assign.due}</span>
                        ${isPending ? `<button class="btn btn-outline-primary btn-sm rounded-pill px-4">Submit</button>` : `<button class="btn btn-light btn-sm rounded-pill text-secondary px-3" disabled>Graded</button>`}
                    </div>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function populateMessages() {
    const contactsList = document.getElementById('contacts-list');
    const chatWindow = document.getElementById('chat-messages');
    
    // Contacts
    appData.contacts.forEach((contact, index) => {
        const onlineBadge = contact.online ? `<i class="fas fa-circle text-success" style="font-size: 8px; position:absolute; bottom:2px; right:2px;"></i>` : '';
        const a = document.createElement('a');
        a.href = '#';
        a.className = `list-group-item list-group-item-action py-3 contact-item border-0 border-bottom bg-transparent ${index === 0 ? 'active' : ''}`;
        a.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="avatar-circle bg-primary-soft text-primary fw-bold me-3 position-relative d-flex align-items-center justify-content-center flex-shrink-0">
                    ${contact.initial}
                    ${onlineBadge}
                </div>
                <div class="w-100">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-1 fw-bold text-dark">${contact.name}</h6>
                        <small class="text-muted">1d</small>
                    </div>
                    <small class="text-secondary text-truncate d-block" style="max-width: 150px;">${contact.subject}</small>
                </div>
            </div>
        `;
        contactsList.appendChild(a);
    });

    // Chat History
    chatWindow.innerHTML = '';
    appData.chatHistory.forEach(msg => {
        const isSender = msg.type === 'sender';
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.type}`;
        
        const timeColor = isSender ? 'text-white-50' : 'text-muted';
        bubble.innerHTML = `
            ${msg.text}
            <div class="small mt-1 ${timeColor} ${isSender ? 'text-end' : ''}" style="font-size: 0.7rem;">${msg.time}</div>
        `;
        chatWindow.appendChild(bubble);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function renderGradesChart() {
    document.getElementById('grades-gpa').textContent = appData.student.gpa.toFixed(1);
    
    // Top Subjects list
    const topList = document.getElementById('top-subjects-list');
    const sorted = appData.gradesSummary.data.map((score, i) => ({sub: appData.gradesSummary.labels[i], score}))
                    .sort((a,b) => b.score - a.score).slice(0,3);
    
    sorted.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light';
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="avatar-circle bg-light d-flex align-items-center justify-content-center me-3 text-secondary" style="width:28px;height:28px;">${index+1}</div>
                <span class="fw-medium">${item.sub}</span>
            </div>
            <span class="fw-bold text-success">${item.score}%</span>
        `;
        topList.appendChild(div);
    });

    // Chart
    const ctx = document.getElementById('gradesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appData.gradesSummary.labels,
            datasets: [{
                label: 'Grade Percentage',
                data: appData.gradesSummary.data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 8,
                borderWidth: 0,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.05)', borderDash: [5, 5] },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}
