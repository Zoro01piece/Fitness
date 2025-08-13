document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggler ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const planSelect = document.getElementById('plan-select');

    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = (currentTheme === 'light' || currentTheme === 'solo-leveling' || currentTheme === 'zen-theme' || currentTheme === 'calisthenics-theme') ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const specialThemes = ['soloLeveling', 'yoga', 'breathing', 'calisthenics'];
        if (specialThemes.includes(planSelect.value)) {
            planSelect.value = 'standard';
        }
    });

    // --- Motivational Quotes ---
    const quotes = [
        { text: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be.", author: "Naruto Uzumaki" },
        { text: "Arise.", author: "Sung Jinwoo, Solo Leveling" },
        { text: "The weak have no choice but to be trampled by the strong.", author: "Goto Ryuji, Solo Leveling" },
        { text: "A dropout will beat a genius through hard work.", author: "Rock Lee, Naruto" },
        { text: "The world isn’t perfect. But it’s there for us, doing the best it can. That’s what makes it so damn beautiful.", author: "Roy Mustang, Fullmetal Alchemist" },
        { text: "Push through the pain. Giving up hurts more.", author: "Vegeta, Dragon Ball Z" }
    ];
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = `"${randomQuote.text}"`;
    quoteAuthor.textContent = `- ${randomQuote.author}`;

    // --- Data structure for a day ---
    const getTodaysDateKey = () => new Date().toISOString().split('T')[0];

    let dailyData = JSON.parse(localStorage.getItem(getTodaysDateKey())) || {
        todos: [],
        mood: null,
        hydration: 0,
        workouts: [],
        rewards: 0
    };
    
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;

    const saveData = () => {
        localStorage.setItem(getTodaysDateKey(), JSON.stringify(dailyData));
    };
    
    const saveProfile = () => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    };

    // --- To-Do List ---
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    const renderTodos = () => {
        todoList.innerHTML = '';
        if (dailyData.todos.length === 0) {
            todoList.innerHTML = `<li class="placeholder">No tasks yet.</li>`;
            return;
        }
        dailyData.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.innerHTML = `
                <span class="todo-text">${todo.text}</span>
                <button class="delete-todo" data-index="${index}">×</button>
            `;
            li.querySelector('.todo-text').addEventListener('click', () => toggleTodo(index));
            li.querySelector('.delete-todo').addEventListener('click', () => deleteTodo(index));
            todoList.appendChild(li);
        });
    };

    const addTodo = (text) => {
        dailyData.todos.push({ text, completed: false, rewarded: false });
        saveData();
        renderTodos();
    };

    const toggleTodo = (index) => {
        const todo = dailyData.todos[index];
        todo.completed = !todo.completed;
        
        if (todo.completed && !todo.rewarded) {
            grantReward();
            todo.rewarded = true;
        }

        saveData();
        renderTodos();
    };
    
    const deleteTodo = (index) => {
        dailyData.todos.splice(index, 1);
        saveData();
        renderTodos();
    };

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            addTodo(text);
            todoInput.value = '';
        }
    });

    // --- Mood Tracker ---
    const moodTracker = document.getElementById('mood-tracker');
    const currentMood = document.getElementById('current-mood');

    const renderMood = () => {
        currentMood.textContent = dailyData.mood || 'Not set';
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.mood === dailyData.mood);
        });
    };

    moodTracker.addEventListener('click', (e) => {
        if (e.target.classList.contains('mood-btn')) {
            dailyData.mood = e.target.dataset.mood;
            saveData();
            renderMood();
        }
    });

    // --- Hydration Log ---
    const hydrationCount = document.getElementById('hydration-count');
    const addGlassBtn = document.getElementById('add-glass-btn');
    const resetHydrationBtn = document.getElementById('reset-hydration-btn');

    const renderHydration = () => {
        hydrationCount.textContent = dailyData.hydration;
    };

    addGlassBtn.addEventListener('click', () => {
        dailyData.hydration++;
        saveData();
        renderHydration();
    });

    resetHydrationBtn.addEventListener('click', () => {
        dailyData.hydration = 0;
        saveData();
        renderHydration();
    });

    // --- Fitness Tracking ---
    const workoutList = document.getElementById('workout-list');
    const workoutDaysNav = document.getElementById('workout-days-nav');
    const workoutPlanContent = document.getElementById('workout-plan-content');
    const heightWeightTableContainer = document.getElementById('height-weight-table-container');

    const workoutPlans = {
        standard: {
            Monday: { name: "Chest & Triceps", exercises: [ { name: 'Bench Press', details: '4 sets of 8-12 reps', icon: '🏋️' }, { name: 'Incline Dumbbell Press', details: '3 sets of 10-15 reps', icon: '🏋️' }, { name: 'Tricep Dips', details: '3 sets to failure', icon: '💪' } ] },
            Tuesday: { name: "Back & Biceps", exercises: [ { name: 'Pull Ups', details: '4 sets to failure', icon: '💪' }, { name: 'Barbell Rows', details: '4 sets of 8-12 reps', icon: '🏋️' }, { name: 'Bicep Curls', details: '3 sets of 10-15 reps', icon: '💪' } ] },
            Wednesday: { name: "Cardio & Core", exercises: [ { name: 'Running', details: '30 minutes', icon: '🏃' }, { name: 'Plank', details: '3 sets of 60s hold', icon: '🧘' }, { name: 'Crunches', details: '3 sets of 20 reps', icon: '🧘' } ] },
            Thursday: { name: "Legs", exercises: [ { name: 'Squats', details: '4 sets of 8-12 reps', icon: '🏋️' }, { name: 'Leg Press', details: '3 sets of 10-15 reps', icon: '🏋️' }, { name: 'Calf Raises', details: '4 sets of 20 reps', icon: '💪' } ] },
            Friday: { name: "Shoulders & Abs", exercises: [ { name: 'Overhead Press', details: '4 sets of 8-12 reps', icon: '🏋️' }, { name: 'Lateral Raises', details: '3 sets of 15-20 reps', icon: '💪' }, { name: 'Leg Raises', details: '3 sets of 20 reps', icon: '🧘' } ] },
            Saturday: { name: "Active Recovery", exercises: [ { name: 'Light Jog or Walk', details: '30-45 minutes', icon: '🚶' }, { name: 'Stretching', details: '15 minutes', icon: '🧘' } ] },
            Sunday: { name: "Rest Day", exercises: [ { name: 'Rest and Recover', details: 'Enjoy your day off!', icon: '😴' } ] }
        },
        soloLeveling: {
            name: "Daily Quest",
            exercises: [
                { name: 'Push-ups', details: '100 Reps', icon: '💪' },
                { name: 'Sit-ups', details: '100 Reps', icon: '🧘' },
                { name: 'Squats', details: '100 Reps', icon: '🏋️' },
                { name: 'Running', details: '10km', icon: '🏃' }
            ],
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            rest: "Sunday"
        },
        yoga: {
            Monday: { name: "Sun Salutations", exercises: [ { name: 'Surya Namaskar A', details: '5 rounds', icon: '☀️' }, { name: 'Surya Namaskar B', details: '5 rounds', icon: '☀️' } ] },
            Tuesday: { name: "Standing Poses", exercises: [ { name: 'Warrior I, II, III', details: '3 breaths each side', icon: '🧘' }, { name: 'Triangle Pose', details: '5 breaths each side', icon: '🧘' } ] },
            Wednesday: { name: "Core & Balance", exercises: [ { name: 'Boat Pose', details: '3 sets, 5 breaths', icon: '⛵' }, { name: 'Crow Pose', details: 'Practice for 5 minutes', icon: '🐦' } ] },
            Thursday: { name: "Hip Openers", exercises: [ { name: 'Pigeon Pose', details: '10 breaths each side', icon: '🕊️' }, { name: 'Lizard Pose', details: '10 breaths each side', icon: '🦎' } ] },
            Friday: { name: "Backbends & Twists", exercises: [ { name: 'Camel Pose', details: '2 sets, 5 breaths', icon: '🐫' }, { name: 'Seated Spinal Twist', details: '5 breaths each side', icon: '🔄' } ] },
            Saturday: { name: "Restorative", exercises: [ { name: 'Child\'s Pose', details: 'Hold for 2 minutes', icon: '👶' }, { name: 'Legs Up The Wall', details: 'Hold for 5 minutes', icon: '🧱' } ] },
            Sunday: { name: "Rest Day", exercises: [ { name: 'Rest and Recover', details: 'Enjoy your day off!', icon: '😴' } ] }
        },
        breathing: {
            Monday: { name: "Diaphragmatic Breathing", exercises: [ { name: 'Belly Breathing', details: '5 minutes, focus on deep inhales', icon: '🌬️' } ] },
            Tuesday: { name: "Box Breathing", exercises: [ { name: 'Sama Vritti', details: '5 minutes, 4s in, 4s hold, 4s out, 4s hold', icon: '🔳' } ] },
            Wednesday: { name: "Relaxing Breath", exercises: [ { name: '4-7-8 Technique', details: '10 rounds before bed', icon: '😌' } ] },
            Thursday: { name: "Alternate Nostril", exercises: [ { name: 'Nadi Shodhana', details: '5 minutes, balancing breath', icon: '👃' } ] },
            Friday: { name: "Energizing Breath", exercises: [ { name: 'Ujjayi Breath', details: '5 minutes, create ocean sound', icon: '🌊' } ] },
            Saturday: { name: "Mindful Observation", exercises: [ { name: 'Observe Natural Breath', details: '10 minutes, no control', icon: '🧠' } ] },
            Sunday: { name: "Rest Day", exercises: [ { name: 'Rest and Recover', details: 'Enjoy your day off!', icon: '😴' } ] }
        },
        calisthenics: {
            Monday: { name: "Upper Body Push", exercises: [ { name: 'Push-up Variations', details: '4 sets to failure', icon: '💪' }, { name: 'Dips', details: '4 sets to failure', icon: '💪' } ] },
            Tuesday: { name: "Upper Body Pull", exercises: [ { name: 'Pull-up Variations', details: '4 sets to failure', icon: '💪' }, { name: 'Bodyweight Rows', details: '4 sets to failure', icon: '💪' } ] },
            Wednesday: { name: "Legs", exercises: [ { name: 'Pistol Squat Progressions', details: '3 sets per leg', icon: '🦵' }, { name: 'Nordic Curls', details: '3 sets to failure', icon: '🦵' } ] },
            Thursday: { name: "Core", exercises: [ { name: 'Hanging Leg Raises', details: '4 sets to failure', icon: '🧘' }, { name: 'Plank Variations', details: '3 sets, 60s hold', icon: '🧘' } ] },
            Friday: { name: "Full Body Circuit", exercises: [ { name: 'Burpees', details: '5 sets of 10 reps', icon: '🏃' }, { name: 'Muscle-up Progressions', details: '5 sets', icon: '🤸' } ] },
            Saturday: { name: "Skill Work", exercises: [ { name: 'Handstand Practice', details: '15 minutes', icon: '🤸' }, { name: 'L-Sit Hold', details: '5 sets to failure', icon: '🤸' } ] },
            Sunday: { name: "Rest Day", exercises: [ { name: 'Rest and Recover', details: 'Enjoy your day off!', icon: '😴' } ] }
        }
    };

    function renderWorkoutPlan(planName) {
        const plan = workoutPlans[planName];
        workoutDaysNav.innerHTML = '';
        workoutPlanContent.innerHTML = '';
        heightWeightTableContainer.style.display = planName === 'standard' ? 'block' : 'none';

        const days = plan.days || Object.keys(plan);

        days.forEach(day => {
            const dayBtn = document.createElement('button');
            dayBtn.className = 'day-btn';
            dayBtn.textContent = day;
            dayBtn.dataset.day = day;
            workoutDaysNav.appendChild(dayBtn);

            const planContainer = document.createElement('div');
            planContainer.className = 'workout-day-plan';
            planContainer.id = `plan-${day}`;
            
            const exerciseList = document.createElement('ul');
            exerciseList.className = 'exercise-list';

            const dayPlan = plan.days ? plan : plan[day];
            dayPlan.exercises.forEach(ex => {
                const isCompleted = dailyData.workouts.includes(ex.name);
                const li = document.createElement('li');
                li.className = `exercise-item ${isCompleted ? 'completed' : ''}`;
                li.innerHTML = `
                    <input type="checkbox" class="exercise-checkbox" data-exercise-name="${ex.name}" ${isCompleted ? 'checked' : ''}>
                    <span class="exercise-icon">${ex.icon}</span>
                    <div class="exercise-details">
                        <h5>${ex.name}</h5>
                        <p>${ex.details}</p>
                    </div>
                `;
                exerciseList.appendChild(li);
            });
            planContainer.appendChild(exerciseList);
            workoutPlanContent.appendChild(planContainer);
        });

        if (plan.rest) {
             const dayBtn = document.createElement('button');
            dayBtn.className = 'day-btn';
            dayBtn.textContent = plan.rest;
            dayBtn.dataset.day = plan.rest;
            workoutDaysNav.appendChild(dayBtn);

            const planContainer = document.createElement('div');
            planContainer.className = 'workout-day-plan';
            planContainer.id = `plan-${plan.rest}`;
            planContainer.innerHTML = `<ul class="exercise-list"><li class="exercise-item"><span class="exercise-icon">😴</span><div class="exercise-details"><h5>Rest and Recover</h5><p>Enjoy your day off!</p></div></li></ul>`;
            workoutPlanContent.appendChild(planContainer);
        }

        setActiveDay(workoutDaysNav);
    }

    function setActiveDay(navElement) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = dayNames[new Date().getDay()];
        
        navElement.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        const parentContainer = navElement.nextElementSibling;
        if (parentContainer) {
            parentContainer.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        }

        const activeBtn = navElement.querySelector(`[data-day="${today}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            const activeContentId = activeBtn.id.replace('btn', 'content');
            const activeContent = document.getElementById(activeContentId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        }
    }

    const planThemes = {
        standard: 'light',
        soloLeveling: 'solo-leveling',
        yoga: 'zen-theme',
        breathing: 'zen-theme',
        calisthenics: 'calisthenics-theme'
    };

    planSelect.addEventListener('change', (e) => {
        const selectedPlan = e.target.value;
        let theme = planThemes[selectedPlan];
        if (theme === 'light') {
            theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
        }
        htmlEl.setAttribute('data-theme', theme);
        renderWorkoutPlan(selectedPlan);
    });

    workoutDaysNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-btn')) {
            const currentActiveBtn = workoutDaysNav.querySelector('.active');
            if (currentActiveBtn) currentActiveBtn.classList.remove('active');
            const currentActivePlan = workoutPlanContent.querySelector('.active');
            if (currentActivePlan) currentActivePlan.classList.remove('active');

            const day = e.target.dataset.day;
            e.target.classList.add('active');
            document.getElementById(`plan-${day}`).classList.add('active');
        }
    });

    workoutPlanContent.addEventListener('change', (e) => {
        if (e.target.classList.contains('exercise-checkbox')) {
            const exerciseName = e.target.dataset.exerciseName;
            const isChecked = e.target.checked;
            
            e.target.closest('.exercise-item').classList.toggle('completed', isChecked);

            if (isChecked) {
                if (!dailyData.workouts.includes(exerciseName)) {
                    dailyData.workouts.push(exerciseName);
                    grantReward();
                }
            } else {
                dailyData.workouts = dailyData.workouts.filter(name => name !== exerciseName);
            }
            saveData();
            renderCompletedExercises();
        }
    });

    const renderCompletedExercises = () => {
        workoutList.innerHTML = '';
        if (dailyData.workouts.length === 0) {
            workoutList.innerHTML = `<li class="placeholder">Check off exercises to log them.</li>`;
            return;
        }
        dailyData.workouts.forEach(exerciseName => {
            const li = document.createElement('li');
            li.innerHTML = `✅ ${exerciseName}`;
            workoutList.appendChild(li);
        });
    };

    // --- Diet Plan Section ---
    const dietPlanSelect = document.getElementById('diet-plan-select');
    const dietPlanContainer = document.getElementById('diet-plan-container');
    const dietDaysNav = document.getElementById('diet-days-nav');
    const dietPlans = {
        balanced: {
            Monday: { Breakfast: 'Oatmeal, Berries', Lunch: 'Chicken Salad', Dinner: 'Salmon, Asparagus' },
            Tuesday: { Breakfast: 'Greek Yogurt, Nuts', Lunch: 'Quinoa Bowl', Dinner: 'Lean Beef Stir-fry' },
            Wednesday: { Breakfast: 'Smoothie', Lunch: 'Lentil Soup', Dinner: 'Turkey Meatballs' },
            Thursday: { Breakfast: 'Eggs, Spinach', Lunch: 'Tuna Salad Sandwich', Dinner: 'Chicken Fajitas' },
            Friday: { Breakfast: 'Cottage Cheese, Fruit', Lunch: 'Leftover Fajitas', Dinner: 'Homemade Pizza' },
            Saturday: { Breakfast: 'Pancakes, Maple Syrup', Lunch: 'Large Salad', Dinner: 'Pasta with Veggies' },
            Sunday: { Breakfast: 'Avocado Toast', Lunch: 'Sunday Roast', Dinner: 'Leftovers' }
        },
        keto: {
            Monday: { Breakfast: 'Bacon, Eggs', Lunch: 'Cobb Salad', Dinner: 'Steak, Creamed Spinach' },
            Tuesday: { Breakfast: 'Keto Coffee', Lunch: 'Zucchini Noodles, Pesto', Dinner: 'Salmon, Avocado' },
            Wednesday: { Breakfast: 'Sausage Patties', Lunch: 'Lettuce-wrap Burger', Dinner: 'Pork Chops, Broccoli' },
            Thursday: { Breakfast: 'Omelette, Cheese', Lunch: 'Leftover Pork Chops', Dinner: 'Chicken Thighs, Asparagus' },
            Friday: { Breakfast: 'Avocado Smoothie', Lunch: 'Tuna-stuffed Avocado', Dinner: 'Keto Pizza' },
            Saturday: { Breakfast: 'Scrambled Eggs, Bacon', Lunch: 'Cauliflower Mac & Cheese', Dinner: 'Ribeye Steak' },
            Sunday: { Breakfast: 'Keto Waffles', Lunch: 'Leftover Steak', Dinner: 'Roast Chicken' }
        },
        vegan: {
            Monday: { Breakfast: 'Tofu Scramble', Lunch: 'Lentil Soup', Dinner: 'Black Bean Burgers' },
            Tuesday: { Breakfast: 'Oatmeal, Flax Seeds', Lunch: 'Quinoa Salad', Dinner: 'Vegan Curry' },
            Wednesday: { Breakfast: 'Smoothie, Protein Powder', Lunch: 'Chickpea Salad Sandwich', Dinner: 'Stuffed Bell Peppers' },
            Thursday: { Breakfast: 'Avocado Toast', Lunch: 'Leftover Peppers', Dinner: 'Vegan Tacos' },
            Friday: { Breakfast: 'Chia Pudding', Lunch: 'Large Green Salad', Dinner: 'Vegan Pizza' },
            Saturday: { Breakfast: 'Vegan Pancakes', Lunch: 'Hummus & Veggie Wrap', Dinner: 'Mushroom Risotto' },
            Sunday: { Breakfast: 'Fruit Salad', Lunch: 'Vegan Chili', Dinner: 'Leftovers' }
        }
    };

    function renderDietPlan(planName) {
        const plan = dietPlans[planName];
        dietDaysNav.innerHTML = '';
        dietPlanContainer.innerHTML = '';

        Object.keys(plan).forEach(day => {
            const dayBtn = document.createElement('button');
            dayBtn.className = 'day-btn';
            dayBtn.textContent = day;
            dayBtn.dataset.day = day;
            dayBtn.id = `diet-btn-${day}`;
            dietDaysNav.appendChild(dayBtn);

            const mealContainer = document.createElement('div');
            mealContainer.className = 'meal-card';
            mealContainer.id = `diet-content-${day}`;
            
            let mealHTML = '';
            Object.entries(plan[day]).forEach(([mealTime, meal]) => {
                mealHTML += `<h4>${mealTime}</h4><p>${meal}</p>`;
            });
            mealContainer.innerHTML = mealHTML;
            dietPlanContainer.appendChild(mealContainer);
        });
        
        setActiveDietDay();
    }
    
    function setActiveDietDay() {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = dayNames[new Date().getDay()];
        
        dietDaysNav.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        dietPlanContainer.querySelectorAll('.active').forEach(el => el.classList.remove('active'));

        const activeBtn = dietDaysNav.querySelector(`[data-day="${today}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            const activeContent = document.getElementById(`diet-content-${today}`);
            if (activeContent) activeContent.classList.add('active');
        }
    }

    dietDaysNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-btn')) {
            dietDaysNav.querySelector('.active')?.classList.remove('active');
            dietPlanContainer.querySelector('.active')?.classList.remove('active');
            
            const day = e.target.dataset.day;
            e.target.classList.add('active');
            document.getElementById(`diet-content-${day}`).classList.add('active');
        }
    });

    dietPlanSelect.addEventListener('change', (e) => renderDietPlan(e.target.value));

    // --- Rewards System ---
    const couponCountEl = document.getElementById('coupon-count');
    const rewardsGridEl = document.getElementById('rewards-grid');
    const redeemBtn = document.getElementById('redeem-btn');

    function grantReward() {
        dailyData.rewards++;
        saveData();
        renderRewards();
    }

    function renderRewards() {
        couponCountEl.textContent = dailyData.rewards;
        rewardsGridEl.innerHTML = '';
        for (let i = 0; i < dailyData.rewards; i++) {
            const coupon = document.createElement('div');
            coupon.className = 'coupon-card';
            coupon.textContent = '🎟️';
            rewardsGridEl.appendChild(coupon);
        }
    }

    redeemBtn.addEventListener('click', () => {
        if (dailyData.rewards > 0) {
            alert(`Congratulations! You've redeemed ${dailyData.rewards} coupon(s). A voucher code has been sent to your (imaginary) email!`);
            dailyData.rewards = 0;
            saveData();
            renderRewards();
        } else {
            alert("You have no coupons to redeem. Complete more tasks!");
        }
    });

    // --- Profile Modal ---
    const profileIcon = document.getElementById('profile-icon');
    const profileModal = document.getElementById('profile-modal');
    const profileContainer = document.getElementById('profile-container');

    function renderProfile() {
        profileContainer.innerHTML = '';
        if (userProfile) {
            const completedTodos = dailyData.todos.filter(t => t.completed).length;
            profileContainer.innerHTML = `
                <h2>${userProfile.name}'s Profile</h2>
                <div id="profile-summary">
                    <p><strong>Email:</strong> ${userProfile.email}</p>
                    <p><strong>Today's Mood:</strong> ${dailyData.mood || 'Not set'}</p>
                    <p><strong>Hydration:</strong> ${dailyData.hydration} glasses</p>
                    <p><strong>To-Dos Completed:</strong> ${completedTodos} / ${dailyData.todos.length}</p>
                    <p><strong>Exercises Completed:</strong> ${dailyData.workouts.length}</p>
                    <p><strong>Coupons Earned Today:</strong> ${dailyData.rewards}</p>
                </div>
            `;
        } else {
            profileContainer.innerHTML = `
                <h2>Create Your Profile</h2>
                <form id="profile-form">
                    <input type="text" id="profile-name" placeholder="Your Name" required>
                    <input type="email" id="profile-email" placeholder="Your Email" required>
                    <button type="submit">Save Profile</button>
                </form>
            `;
            document.getElementById('profile-form').addEventListener('submit', (e) => {
                e.preventDefault();
                userProfile = {
                    name: document.getElementById('profile-name').value,
                    email: document.getElementById('profile-email').value
                };
                saveProfile();
                renderProfile();
            });
        }
    }

    profileIcon.addEventListener('click', () => {
        renderProfile();
        profileModal.style.display = 'block';
    });

    // --- Memory Game ---
    function loadMemoryGame(container) {
        container.innerHTML = `
            <h2>Memory Match</h2>
            <div class="game-controls">
                <p>Matches: <span id="match-count">0</span></p>
                <button id="reset-game-btn">Reset Game</button>
            </div>
            <div id="memory-game-board" class="memory-game"></div>
        `;
        const gameBoard = container.querySelector('#memory-game-board');
        const matchCountEl = container.querySelector('#match-count');
        const resetGameBtn = container.querySelector('#reset-game-btn');
        const emojis = ['🧠', '💪', '🧘', '💧', '🍎', '🥕', '🎉', '🌟'];
        let cards = [...emojis, ...emojis];
        let flippedCards = [];
        let matchedPairs = 0;
        let lockBoard = false;

        function shuffle(array) { array.sort(() => Math.random() - 0.5); }
        function createBoard() {
            gameBoard.innerHTML = '';
            matchedPairs = 0;
            matchCountEl.textContent = 0;
            shuffle(cards);
            cards.forEach(emoji => {
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.emoji = emoji;
                card.innerHTML = `<div class="front-face">${emoji}</div><div class="back-face"></div>`;
                card.addEventListener('click', flipCard);
                gameBoard.appendChild(card);
            });
        }
        function flipCard() {
            if (lockBoard || this === flippedCards[0] || this.classList.contains('matched')) return;
            this.classList.add('flip');
            flippedCards.push(this);
            if (flippedCards.length === 2) {
                lockBoard = true;
                checkForMatch();
            }
        }
        function checkForMatch() {
            const [card1, card2] = flippedCards;
            const isMatch = card1.dataset.emoji === card2.dataset.emoji;
            isMatch ? disableCards() : unflipCards();
        }
        function disableCards() {
            flippedCards.forEach(card => {
                card.removeEventListener('click', flipCard);
                card.classList.add('matched');
            });
            matchedPairs++;
            matchCountEl.textContent = matchedPairs;
            resetFlipped();
        }
        function unflipCards() {
            setTimeout(() => {
                flippedCards.forEach(card => card.classList.remove('flip'));
                resetFlipped();
            }, 1000);
        }
        function resetFlipped() { [flippedCards, lockBoard] = [[], false]; }
        resetGameBtn.addEventListener('click', createBoard);
        createBoard();
    }

    // --- Sudoku Game ---
    function loadSudokuGame(container) {
        container.innerHTML = `
            <h2>Sudoku</h2>
            <div id="sudoku-board"></div>
            <div class="game-controls">
                <p id="sudoku-message"></p>
                <div>
                    <button id="sudoku-check-btn">Check</button>
                    <button id="sudoku-reset-btn">Reset</button>
                </div>
            </div>
        `;
        const boardEl = container.querySelector('#sudoku-board');
        const messageEl = container.querySelector('#sudoku-message');
        const puzzle = [ [5,3,0,0,7,0,0,0,0], [6,0,0,1,9,5,0,0,0], [0,9,8,0,0,0,0,6,0], [8,0,0,0,6,0,0,0,3], [4,0,0,8,0,3,0,0,1], [7,0,0,0,2,0,0,0,6], [0,6,0,0,0,0,2,8,0], [0,0,0,4,1,9,0,0,5], [0,0,0,0,8,0,0,7,9] ];
        const solution = [ [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7], [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6], [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9] ];
        function generateBoard() {
            boardEl.innerHTML = '';
            messageEl.textContent = '';
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    const cell = document.createElement('input');
                    cell.classList.add('sudoku-cell');
                    cell.type = 'number';
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    if (puzzle[r][c] !== 0) {
                        cell.value = puzzle[r][c];
                        cell.disabled = true;
                    }
                    boardEl.appendChild(cell);
                }
            }
        }
        container.querySelector('#sudoku-check-btn').addEventListener('click', () => {
            let isCorrect = true;
            boardEl.querySelectorAll('.sudoku-cell').forEach(cell => {
                if (!cell.disabled) {
                    const r = cell.dataset.row;
                    const c = cell.dataset.col;
                    if (parseInt(cell.value) !== solution[r][c]) {
                        isCorrect = false;
                        cell.style.backgroundColor = 'var(--accent-fitness)';
                    } else {
                        cell.style.backgroundColor = 'var(--accent-success)';
                    }
                }
            });
            messageEl.textContent = isCorrect ? 'Congratulations!' : 'Incorrect.';
        });
        container.querySelector('#sudoku-reset-btn').addEventListener('click', generateBoard);
        generateBoard();
    }

    // --- Hangman Game ---
    function loadHangmanGame(container) {
        const words = ["STRENGTH", "AGILITY", "HEALTH", "ZENITH", "POWER", "FOCUS"];
        let selectedWord, guessed, wrongGuesses;
        
        container.innerHTML = `
            <h2>Hangman</h2>
            <div class="hangman-container">
                <p id="hangman-guesses">Wrong Guesses: 0/6</p>
                <div id="hangman-word" class="hangman-word"></div>
                <div id="alphabet-buttons" class="alphabet-buttons"></div>
            </div>
        `;

        const wordEl = container.querySelector('#hangman-word');
        const guessesEl = container.querySelector('#hangman-guesses');
        const alphabetButtonsEl = container.querySelector('#alphabet-buttons');

        function startGame() {
            selectedWord = words[Math.floor(Math.random() * words.length)];
            guessed = [];
            wrongGuesses = 0;
            wordEl.innerHTML = selectedWord.split('').map(() => `<span>_</span>`).join('');
            guessesEl.textContent = `Wrong Guesses: 0/6`;
            renderButtons();
        }

        function renderButtons() {
            alphabetButtonsEl.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter =>
                `<button class="alphabet-btn" data-letter="${letter}">${letter}</button>`
            ).join('');
        }

        function handleGuess(e) {
            if (!e.target.matches('.alphabet-btn') || e.target.disabled) return;
            const letter = e.target.dataset.letter;
            e.target.disabled = true;

            if (selectedWord.includes(letter)) {
                guessed.push(letter);
                wordEl.innerHTML = selectedWord.split('').map(l => guessed.includes(l) ? `<span>${l}</span>` : `<span>_</span>`).join('');
                if (!wordEl.textContent.includes('_')) endGame(true);
            } else {
                wrongGuesses++;
                guessesEl.textContent = `Wrong Guesses: ${wrongGuesses}/6`;
                if (wrongGuesses >= 6) endGame(false);
            }
        }

        function endGame(isWin) {
            alphabetButtonsEl.innerHTML = `<h3>${isWin ? "You Won!" : `You Lost! Word: ${selectedWord}`}</h3>`;
            setTimeout(startGame, 3000);
        }

        alphabetButtonsEl.addEventListener('click', handleGuess);
        startGame();
    }

    // --- 2048 Game ---
    function load2048Game(container) {
        container.innerHTML = `
            <h2>2048</h2>
            <div class="game-controls">
                <p>Score: <span id="score-2048">0</span></p>
                <button id="reset-2048-btn">Reset</button>
            </div>
            <div class="grid-2048"></div>
        `;
        const gridEl = container.querySelector('.grid-2048');
        const scoreEl = container.querySelector('#score-2048');
        let grid = Array(4).fill(null).map(() => Array(4).fill(0));
        let score = 0;

        function init() {
            grid = Array(4).fill(null).map(() => Array(4).fill(0));
            score = 0;
            addRandomTile();
            addRandomTile();
            render();
        }

        function render() {
            gridEl.innerHTML = '';
            scoreEl.textContent = score;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const tile = document.createElement('div');
                    tile.className = 'tile-2048';
                    if (grid[r][c] !== 0) {
                        tile.textContent = grid[r][c];
                        tile.dataset.value = grid[r][c];
                    }
                    gridEl.appendChild(tile);
                }
            }
        }

        function addRandomTile() {
            let emptyTiles = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (grid[r][c] === 0) emptyTiles.push({ r, c });
                }
            }
            if (emptyTiles.length > 0) {
                const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
                grid[r][c] = Math.random() < 0.9 ? 2 : 4;
            }
        }

        function slide(row) {
            let arr = row.filter(val => val);
            let missing = 4 - arr.length;
            let zeros = Array(missing).fill(0);
            return arr.concat(zeros);
        }

        function combine(row) {
            for (let i = 0; i < 3; i++) {
                if (row[i] !== 0 && row[i] === row[i + 1]) {
                    row[i] *= 2;
                    score += row[i];
                    row[i + 1] = 0;
                }
            }
            return row;
        }

        function operate(row) {
            row = slide(row);
            row = combine(row);
            row = slide(row);
            return row;
        }

        function move(e) {
            const originalGrid = JSON.parse(JSON.stringify(grid));

            if (e.key === 'ArrowUp') {
                for (let c = 0; c < 4; c++) {
                    let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
                    col = operate(col);
                    for (let r = 0; r < 4; r++) grid[r][c] = col[r];
                }
            } else if (e.key === 'ArrowDown') {
                for (let c = 0; c < 4; c++) {
                    let col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
                    col = operate(col);
                    for (let r = 0; r < 4; r++) grid[3 - r][c] = col[r];
                }
            } else if (e.key === 'ArrowLeft') {
                for (let r = 0; r < 4; r++) grid[r] = operate(grid[r]);
            } else if (e.key === 'ArrowRight') {
                for (let r = 0; r < 4; r++) grid[r] = operate(grid[r].reverse()).reverse();
            }

            if (JSON.stringify(originalGrid) !== JSON.stringify(grid)) {
                addRandomTile();
                render();
            }
        }

        document.addEventListener('keydown', move);
        gameModal.addEventListener('game:close', () => document.removeEventListener('keydown', move), { once: true });
        container.querySelector('#reset-2048-btn').addEventListener('click', init);
        init();
    }

    // --- Minesweeper Game ---
    function loadMinesweeperGame(container) {
        const ROWS = 10, COLS = 10, MINES = 15;
        let board, gameOver;

        container.innerHTML = `
            <h2>Minesweeper</h2>
            <div class="game-controls">
                <p id="minesweeper-status">Good luck!</p>
                <button id="minesweeper-reset">Reset</button>
            </div>
            <div class="minesweeper-board"></div>
        `;
        const boardEl = container.querySelector('.minesweeper-board');
        const statusEl = container.querySelector('#minesweeper-status');

        function init() {
            boardEl.innerHTML = '';
            boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
            gameOver = false;
            statusEl.textContent = 'Good luck!';
            board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ isMine: false, revealed: false, flagged: false, neighbors: 0 })));

            let minesPlaced = 0;
            while (minesPlaced < MINES) {
                const r = Math.floor(Math.random() * ROWS);
                const c = Math.floor(Math.random() * COLS);
                if (!board[r][c].isMine) {
                    board[r][c].isMine = true;
                    minesPlaced++;
                }
            }

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c].isMine) continue;
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                                count++;
                            }
                        }
                    }
                    board[r][c].neighbors = count;
                }
            }
            render();
        }

        function render() {
            boardEl.innerHTML = '';
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'mine-cell';
                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    if (board[r][c].revealed) {
                        cell.classList.add('revealed');
                        if (board[r][c].isMine) cell.textContent = '💣';
                        else if (board[r][c].neighbors > 0) cell.textContent = board[r][c].neighbors;
                    } else if (board[r][c].flagged) {
                        cell.textContent = '🚩';
                    }
                    boardEl.appendChild(cell);
                }
            }
        }

        function reveal(r, c) {
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c].revealed || board[r][c].flagged) return;
            board[r][c].revealed = true;
            if (board[r][c].isMine) {
                endGame(false);
            } else if (board[r][c].neighbors === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        reveal(r + dr, c + dc);
                    }
                }
            }
            checkWin();
        }
        
        function checkWin() {
            const revealedCount = board.flat().filter(c => c.revealed).length;
            if (revealedCount === ROWS * COLS - MINES) endGame(true);
        }

        function endGame(win) {
            gameOver = true;
            statusEl.textContent = win ? 'You Win!' : 'Game Over!';
            board.forEach(row => row.forEach(cell => { if (cell.isMine) cell.revealed = true; }));
            render();
        }

        boardEl.addEventListener('click', e => {
            if (gameOver || !e.target.matches('.mine-cell')) return;
            const { r, c } = e.target.dataset;
            reveal(parseInt(r), parseInt(c));
            render();
        });

        boardEl.addEventListener('contextmenu', e => {
            e.preventDefault();
            if (gameOver || !e.target.matches('.mine-cell')) return;
            const { r, c } = e.target.dataset;
            const cell = board[r][c];
            if (!cell.revealed) {
                cell.flagged = !cell.flagged;
                render();
            }
        });

        container.querySelector('#minesweeper-reset').addEventListener('click', init);
        init();
    }

    // --- Game Modal Logic ---
    const gameModal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    document.querySelectorAll('.game-launcher-card .play-btn').forEach(button => {
        button.addEventListener('click', () => {
            const gameType = button.closest('.game-launcher-card').dataset.game;
            gameContainer.innerHTML = ''; // Clear previous game
            if (gameType === 'memory') loadMemoryGame(gameContainer);
            else if (gameType === 'sudoku') loadSudokuGame(gameContainer);
            else if (gameType === 'hangman') loadHangmanGame(gameContainer);
            else if (gameType === '2048') load2048Game(gameContainer);
            else if (gameType === 'minesweeper') loadMinesweeperGame(gameContainer);
            
            gameModal.style.display = 'block';
        });
    });

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        // Dispatch a custom event to clean up game-specific listeners
        gameModal.dispatchEvent(new CustomEvent('game:close'));
    }

    closeModalBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // --- Calendar (Simple Placeholder) ---
    const calendarContainer = document.getElementById('calendar-container');
    function renderCalendar() {
        calendarContainer.innerHTML = `<p>Calendar view is a future feature. Today is <strong>${getTodaysDateKey()}</strong>. Your data is saved for today!</p>`;
    }

    // --- Initial Load ---
    function loadInitialData() {
        renderTodos();
        renderMood();
        renderHydration();
        renderWorkoutPlan(planSelect.value);
        renderCompletedExercises();
        renderDietPlan(dietPlanSelect.value);
        renderRewards();
        renderCalendar();
    }

    loadInitialData();
});
