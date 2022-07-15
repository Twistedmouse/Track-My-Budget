let db;

// New db request for a "budget" database.
const request = indexedDB.open("budget", 1);

init();

function init() {
  request.onupgradeneeded = function (event) {
    // Object store called "BudgetStore", autoIncrement set to true
    const db = event.target.result;
    const BudgetObjectStore = db.createObjectStore("BudgetStore", {
      autoIncrement: true,
    });
  };
}

request.onsuccess = function (event) {
  db = event.target.result;
  // Checking if the application is online before reading from database
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // Logging error
  console.error(event.target.error);
};

function saveRecord(record) {
  // Creating a transaction on the pending db with readwrite access
  const db = request.result;
  // Accessing the pending object store
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  // Adding record to store with add method.
  const budgetObjectStore = transaction.objectStore("BudgetStore");
  // Adds data to the objectStore
  budgetObjectStore.add(record);
}

function checkDatabase() {
  // Opening a transaction on the pending db
  const db = request.result;
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  // Accessing the pending object store
  const budgetObjectStore = transaction.objectStore("BudgetStore");
  // Gets all records from store and set to getAll variable
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // Opening a transaction on the pending db
          const db = request.result;
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          // Accessing the pending object store
          const BudgetObjectStore = transaction.objectStore("BudgetStore");
          // Clears all items in the store
          BudgetObjectStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// Listening for app coming back online
window.addEventListener("online", checkDatabase);
