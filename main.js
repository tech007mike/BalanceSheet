// Initialize liabilities and assets arrays with saved data from localStorage, if available
let liabilities = JSON.parse(localStorage.getItem('liabilities')) || [];
const assets = {}; // Currently not used but reserved for future use

// Load saved liabilities and update the UI
function loadData() {
    liabilities = JSON.parse(localStorage.getItem('liabilities')) || [];
    calculateBalances();
}

// Save liabilities to localStorage
function saveData() {
    localStorage.setItem('liabilities', JSON.stringify(liabilities));
}

// Event listener for the "Add Item" button
document.getElementById('add-item').addEventListener('click', () => {
    const category = document.getElementById('category').value;
    const principal = parseFloat(document.getElementById('principal').value);
    const apr = parseFloat(document.getElementById('apr').value) / 100; // Convert percentage to decimal
    const minPayment = parseFloat(document.getElementById('minPayment').value);
    const paymentDate = document.getElementById('paymentDate').value;

    // Ensure all fields are filled; if not, alert the user.
    if (category && principal && apr && minPayment && paymentDate) {
        liabilities.push({
            category,
            balance: principal,
            apr,
            minPayment,
            paymentDate
        });
        saveData(); // Save to localStorage
        calculateBalances();
        // Clear input fields after adding
        document.getElementById('category').value = '';
        document.getElementById('principal').value = '';
        document.getElementById('apr').value = '';
        document.getElementById('minPayment').value = '';
        document.getElementById('paymentDate').value = '';
    } else {
        alert("Please fill in all fields.");
    }
});

// Function to calculate updated balances and display the balance sheet
function calculateBalances() {
    const today = new Date();
    const startDate = new Date(2025, 0, 1); // January 1, 2025
    const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 +
                          (today.getMonth() - startDate.getMonth());

    let totalLiabilities = 0;
    let totalAssets = 0;

    const balanceSheet = document.getElementById("balanceSheet");
    balanceSheet.innerHTML = ""; // Clear the balance sheet before re-rendering

    liabilities.forEach((item) => {
        let remainingBalance = item.balance;

        // Calculate the balance after interest and payments for the elapsed months
        for (let i = 0; i < monthsElapsed; i++) {
            const interest = remainingBalance * (item.apr / 12);
            remainingBalance = Math.max(0, remainingBalance + interest - item.minPayment);
        }

        totalLiabilities += remainingBalance;

        const paymentsRemaining = Math.ceil(remainingBalance / item.minPayment);
        const payoffDate = new Date(today.getFullYear(), today.getMonth() + paymentsRemaining, today.getDate());
        
        // Build the HTML string for this item
        const itemDiv = `
          <div class="item-container">
            <p><span>Description:</span> ${item.category}</p>
            <p><span>Starting Balance:</span> $${item.balance.toFixed(2)}</p>
            <p><span>Monthly Payment:</span> $${item.minPayment.toFixed(2)}</p>
            <p class="${remainingBalance > 0 ? 'negative' : ''}">
              <span>Current Balance:</span> $${remainingBalance.toFixed(2)}
            </p>
            <p><span>Payments Remaining:</span> ${paymentsRemaining} months</p>
            <p><span>Payoff Date:</span> ${payoffDate.toLocaleDateString()}</p>
          </div>`;
        balanceSheet.innerHTML += itemDiv;
    });

    // Calculate net worth (here assumed as negative liabilities)
    const netWorth = 0 - totalLiabilities;
    document.getElementById("netWorth").textContent = `$${netWorth.toFixed(2)}`;
}

// Display the current date and perform the initial balance calculation
document.getElementById("date").textContent = `As of: ${new Date().toLocaleDateString()}`;

// Load data on page load
loadData();