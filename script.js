// Animate on scroll
const sections = document.querySelectorAll('.animate');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("visible", entry.isIntersecting);
    });
  }, { threshold: 0.1 }
);
sections.forEach(sec => observer.observe(sec));

// Scroll progress
const progress = document.getElementById("scroll-progress");
window.addEventListener("scroll", () => {
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollTop = window.scrollY;
  progress.style.width = `${(scrollTop / docHeight) * 100}%`;
});

// Expense Tracker logic
const form = document.getElementById("expense-form");
const tableBody = document.querySelector("#expense-table tbody");
const summary = document.getElementById("summary");
const splitSummary = document.getElementById("split-summary");

let expenses = [];

form.addEventListener("submit", e => {
  e.preventDefault();
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const payer = document.getElementById("payer").value.trim();
  const category = document.getElementById("category").value;
  if (!desc || !amount || !payer) return;

  expenses.push({ desc, amount, payer, category });
  updateTable();
  updateSplit();
  drawChart();
  form.reset();
});

function updateTable() {
  tableBody.innerHTML = "";
  expenses.forEach(exp => {
    const row = `<tr>
      <td>${exp.desc}</td>
      <td>₹${exp.amount}</td>
      <td>${exp.payer}</td>
      <td>${exp.category}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

function updateSplit() {
  if (expenses.length === 0) {
    splitSummary.textContent = "No expenses yet.";
    return;
  }
  const people = {};
  expenses.forEach(exp => {
    people[exp.payer] = (people[exp.payer] || 0) + exp.amount;
  });
  const total = Object.values(people).reduce((a, b) => a + b, 0);
  const equalShare = total / Object.keys(people).length;

  let result = `<strong>Total: ₹${total.toFixed(2)}</strong><br>`;
  result += `<strong>Each person should pay: ₹${equalShare.toFixed(2)}</strong><br><br>`;
  Object.entries(people).forEach(([name, paid]) => {
    const balance = paid - equalShare;
    if (balance > 0) result += `${name} should receive ₹${balance.toFixed(2)}<br>`;
    else if (balance < 0) result += `${name} owes ₹${Math.abs(balance).toFixed(2)}<br>`;
    else result += `${name} is settled.<br>`;
  });
  splitSummary.innerHTML = result;
  summary.innerHTML = result;
}

// Soft 3D Pie Chart
let chart;
function drawChart() {
  const ctx = document.getElementById('summaryChart').getContext('2d');
  if (chart) chart.destroy();

  const payers = {};
  expenses.forEach(exp => {
    payers[exp.payer] = (payers[exp.payer] || 0) + exp.amount;
  });

  const labels = Object.keys(payers);
  const data = Object.values(payers);

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#6C5CE7', '#00B894', '#0984E3', '#FAB1A0', '#FFEAA7'
        ],
        borderWidth: 4,
        borderColor: '#0a0a23',
        hoverOffset: 20
      }]
    },
    options: {
      rotation: -30, // pseudo-3D tilt
      plugins: {
        legend: {
          labels: {
            color: '#fff',
            font: { size: 14, family: 'Inter' }
          }
        },
        tooltip: {
          bodyFont: { family: 'Inter', size: 14 }
        }
      }
    }
  });
}
