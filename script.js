document.addEventListener('DOMContentLoaded', () => {
      const taskForm = document.getElementById('task-form');
      const taskInput = document.getElementById('task-input');
      const allottedTimeInput = document.getElementById('allotted-time');
      const taskList = document.getElementById('task-list');
      const currentDateTimeElement = document.getElementById('current-datetime');
      const toggleLogButton = document.getElementById('toggle-log');
      const logContent = document.getElementById('log-content');
      const logTabs = document.querySelectorAll('.log-tab');
      const logViews = document.querySelectorAll('.log-view');
      const stealthToggle = document.getElementById('stealth-toggle');
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      let taskLog = JSON.parse(localStorage.getItem('taskLog')) || [];

      function updateCurrentDateTime() {
        const now = new Date();
        const formattedDateTime = now.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        currentDateTimeElement.textContent = formattedDateTime;
      }

      function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
          const li = document.createElement('li');
          li.className = `task-item ${task.completed ? 'completed' : ''}`;
          li.innerHTML = `
            <div class="task-content">
              <span class="task-text">${task.text}</span>
              <span class="task-timestamp">Created: ${task.timestamp}</span>
              <span class="task-allotted-time">Allotted time: ${task.allottedTime}</span>
              ${task.completed ? `<span class="task-completion-timestamp">Completed: ${task.completedAt}</span>` : ''}
            </div>
            <button class="delete-task" data-index="${index}">×</button>
          `;
          li.addEventListener('click', () => toggleTask(index));
          taskList.appendChild(li);
        });
      }

      function addTask(text, allottedTime) {
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        tasks.push({ text, allottedTime, completed: false, timestamp, completedAt: null, createdTime: now.getTime() });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
      }

      function deleteTask(index) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
      }

      function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].completed) {
          const now = new Date();
          const completedAt = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          tasks[index].completedAt = completedAt;
          const timeSpent = now.getTime() - tasks[index].createdTime;
          const logEntry = {
            task: tasks[index].text,
            completedAt: completedAt,
            timeSpent: formatTimeSpent(timeSpent),
            allottedTime: tasks[index].allottedTime,
            completedAtTimestamp: now.getTime()
          };
          taskLog.push(logEntry);
          localStorage.setItem('taskLog', JSON.stringify(taskLog));
        } else {
          tasks[index].completedAt = null;
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderLogEntries();
      }

      function formatTimeSpent(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
          return `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
          return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
        } else {
          return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
      }

      function renderLogEntries() {
        const dayView = document.getElementById('day-view');
        const weekView = document.getElementById('week-view');
        const monthView = document.getElementById('month-view');

        dayView.innerHTML = '';
        weekView.innerHTML = '';
        monthView.innerHTML = '';

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay; // Approximate

        taskLog.forEach((entry) => {
          const entryDate = new Date(entry.completedAtTimestamp);
          const timeDiff = now.getTime() - entryDate.getTime();

          const logEntryElement = document.createElement('div');
          logEntryElement.className = 'log-entry';
          logEntryElement.textContent = `${entry.task} - Completed at: ${entry.completedAt} - Time spent: ${entry.timeSpent} - Allotted time: ${entry.allottedTime}`;

          if (timeDiff <= oneDay) {
            dayView.appendChild(logEntryElement.cloneNode(true));
          }
          if (timeDiff <= oneWeek) {
            weekView.appendChild(logEntryElement.cloneNode(true));
          }
          if (timeDiff <= oneMonth) {
            monthView.appendChild(logEntryElement.cloneNode(true));
          }
        });
      }

      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const allottedTime = allottedTimeInput.value.trim();
        if (taskText && allottedTime) {
          addTask(taskText, allottedTime);
          taskInput.value = '';
          allottedTimeInput.value = '';
        }
      });

      taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-task')) {
          const index = e.target.dataset.index;
          deleteTask(index);
          e.stopPropagation(); // Prevent task toggle when deleting
        }
      });

      toggleLogButton.addEventListener('click', () => {
        if (logContent.style.display === 'none' || logContent.style.display === '') {
          logContent.style.display = 'block';
          toggleLogButton.textContent = 'Hide Log';
          renderLogEntries();
        } else {
          logContent.style.display = 'none';
          toggleLogButton.textContent = 'Show Log';
        }
      });

      logTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          logTabs.forEach(t => t.classList.remove('active'));
          logViews.forEach(v => v.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(`${tab.dataset.view}-view`).classList.add('active');
        });
      });

      stealthToggle.addEventListener('click', () => {
        document.body.classList.toggle('stealth-mode');
      });

      renderTasks();
      updateCurrentDateTime();
      setInterval(updateCurrentDateTime, 1000); // Update every second
    });
