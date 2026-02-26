// SIMPLE PASSWORD HASH
function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = (hash << 5) - hash + password.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

// REGISTER
function register() {
    let username = document.getElementById("regUsername").value;
    let password = document.getElementById("regPassword").value;

    if (!username || !password) {
        alert("Fill all fields");
        return;
    }

    localStorage.setItem("user_" + username, simpleHash(password));
    alert("Account created!");
    window.location.href = "index.html";
}

// LOGIN
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let storedPassword = localStorage.getItem("user_" + username);

    if (storedPassword == simpleHash(password)) {
        localStorage.setItem("currentUser", username);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid login");
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// LOAD DASHBOARD
function loadDashboard() {
    let user = localStorage.getItem("currentUser");
    if (!user) {
        window.location.href = "index.html";
    }
    loadData();
}

// ADD SAVINGS
function addSavings() {
    let user = localStorage.getItem("currentUser");
    let amount = parseFloat(document.getElementById("amount").value);

    if (!amount) return;

    let savings = JSON.parse(localStorage.getItem("savings_" + user)) || [];

    savings.push({
        amount: amount,
        date: new Date().toISOString()
    });

    localStorage.setItem("savings_" + user, JSON.stringify(savings));
    document.getElementById("amount").value = "";
    loadData();
}

// ADD EXPENSE
function addExpense() {
    let user = localStorage.getItem("currentUser");
    let amount = parseFloat(document.getElementById("expenseAmount").value);

    if (!amount) return;

    let expenses = JSON.parse(localStorage.getItem("expenses_" + user)) || [];

    expenses.push({
        amount: amount,
        date: new Date().toISOString()
    });

    localStorage.setItem("expenses_" + user, JSON.stringify(expenses));
    document.getElementById("expenseAmount").value = "";
    loadData();
}

// LOAD DATA
function loadData() {
    let user = localStorage.getItem("currentUser");

    let savings = JSON.parse(localStorage.getItem("savings_" + user)) || [];
    let expenses = JSON.parse(localStorage.getItem("expenses_" + user)) || [];

    let total = 0;
    let monthlyTotal = 0;
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";

    let currentMonth = new Date().getMonth();
    let chartData = [];

    savings.forEach(item => {
        total += item.amount;
        chartData.push(item.amount);

        let itemMonth = new Date(item.date).getMonth();
        if (itemMonth === currentMonth) {
            monthlyTotal += item.amount;
        }

        let li = document.createElement("li");
        li.innerText = new Date(item.date).toLocaleDateString() + " - Saved: " + item.amount;
        historyList.appendChild(li);
    });

    let totalExpenses = 0;
    expenses.forEach(item => {
        totalExpenses += item.amount;

        let li = document.createElement("li");
        li.innerText = new Date(item.date).toLocaleDateString() + " - Expense: " + item.amount;
        historyList.appendChild(li);
    });

    document.getElementById("total").innerText = total;
    document.getElementById("totalExpenses").innerText = totalExpenses;
    document.getElementById("monthlySaved").innerText = monthlyTotal;

    let goal = parseFloat(document.getElementById("goal").value) || 0;
    let remaining = goal - total;
    let percentage = goal ? (total / goal) * 100 : 0;

    document.getElementById("remaining").innerText = remaining;
    document.getElementById("progressBar").value = percentage;

    document.getElementById("advice").innerText = savingAdvice(total, totalExpenses);

    loadChart(chartData);
}

// SMART ADVICE
function savingAdvice(total, expenses) {
    if (expenses > total) return "⚠ You are spending more than saving!";
    if (total > 5000) return "🔥 Great job! Consider investing some savings.";
    if (total < 1000) return "💡 Try saving small amounts daily.";
    return "👍 Keep going!";
}

// LOAD CHART
let chartInstance;

function loadChart(data) {
    const ctx = document.getElementById("chart");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => "Save " + (i + 1)),
            datasets: [{
                label: 'Savings Growth',
                data: data,
                borderWidth: 2
            }]
        }
    });
}