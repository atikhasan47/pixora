// firebase-sync.js — Firebase Connection Helper
// Atik Daily Earning — User + Admin Connected System

var firebaseConfig = {
  apiKey: "AIzaSyBOBKaweaxU9ZeG5W2E8-OBQfgGVPozEU4",
  authDomain: "atik-8be75.firebaseapp.com",
  databaseURL: "https://atik-8be75-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "atik-8be75",
  storageBucket: "atik-8be75.firebasestorage.app",
  messagingSenderId: "718092509865",
  appId: "1:718092509865:web:5a335726962a7cef013fb8",
  measurementId: "G-C258TYBSM3"
};

var ADMIN_UID = "xG2YRIEoNeNlToKYap62QQs1EKa2";
var DB_URL = firebaseConfig.databaseURL;

// ============= Firebase SDK Loader =============
function loadFirebaseSDK() {
  return new Promise(function(resolve, reject) {
    if (window.firebase && window.firebase.initializeApp) {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      resolve(window.firebase);
      return;
    }
    var script = document.createElement('script');
    script.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
    script.onload = function() {
      var authScript = document.createElement('script');
      authScript.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js";
      authScript.onload = function() {
        var dbScript = document.createElement('script');
        dbScript.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
        dbScript.onload = function() {
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp(firebaseConfig);
          }
          resolve(window.firebase);
        };
        dbScript.onerror = reject;
        document.head.appendChild(dbScript);
      };
      authScript.onerror = reject;
      document.head.appendChild(authScript);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ============= Database REST Helpers =============
var DB = {
  get: function(path) {
    return fetch(DB_URL + path + '.json')
      .then(function(r){ return r.json(); });
  },
  set: function(path, data) {
    return fetch(DB_URL + path + '.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){ return r.json(); });
  },
  update: function(path, data) {
    return fetch(DB_URL + path + '.json', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){ return r.json(); });
  },
  push: function(path, data) {
    return fetch(DB_URL + path + '.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){ return r.json(); });
  },
  delete: function(path) {
    return fetch(DB_URL + path + '.json', {
      method: 'DELETE'
    }).then(function(r){ return r.json(); });
  }
};

// ============= Settings (Global) =============
var SETTINGS = {
  adsReward: 0.10,
  jobReward: 0.20,
  mathReward: 0.04,
  adsTimer: 8,
  adDailyLimit: 10,
  minDeposit: 100,
  minWithdraw: 110,
  withdrawFee: 10,
  promotionServices: {}
};

function loadSettings(callback) {
  DB.get('/settings').then(function(data) {
    if (data) {
      SETTINGS = Object.assign(SETTINGS, data);
    }
    if (callback) callback(SETTINGS);
  }).catch(function() {
    if (callback) callback(SETTINGS);
  });
}

function saveSettings(newSettings) {
  return DB.update('/settings', newSettings);
}

// ============= User Management =============
function getUser(email) {
  return DB.get('/users/' + email.replace(/[.#$\[\]]/g, '_'));
}
function saveUser(user) {
  var key = user.email.replace(/[.#$\[\]]/g, '_');
  return DB.set('/users/' + key, user);
}
function getAllUsers() {
  return DB.get('/users');
}

// ============= Chats =============
function sendMessage(userEmail, message) {
  var key = userEmail.replace(/[.#$\[\]]/g, '_');
  return DB.push('/chats/' + key, message);
}
function getMessages(userEmail) {
  var key = userEmail.replace(/[.#$\[\]]/g, '_');
  return DB.get('/chats/' + key);
}

// ============= Job Proofs =============
function submitJobProof(proof) {
  return DB.push('/job_proofs', proof);
}
function getJobProofs() {
  return DB.get('/job_proofs');
}
function updateJobProof(id, data) {
  return DB.update('/job_proofs/' + id, data);
}

// ============= Notifications =============
function sendNotification(notif) {
  return DB.push('/notifications', notif);
}
function getNotifications(email) {
  return DB.get('/notifications').then(function(data) {
    if (!data) return [];
    var arr = [];
    Object.keys(data).forEach(function(k) {
      var n = data[k];
      if (n.target === 'all' || n.target === email) {
        arr.push(Object.assign({ id: k }, n));
      }
    });
    return arr.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
  });
}

// ============= Orders =============
function submitOrder(order) {
  return DB.push('/orders', order);
}
function getOrders() {
  return DB.get('/orders');
}
function getUserOrders(email) {
  return DB.get('/orders').then(function(data) {
    if (!data) return [];
    var arr = [];
    Object.keys(data).forEach(function(k) {
      if (data[k].userEmail === email) arr.push(Object.assign({ id: k }, data[k]));
    });
    return arr.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
  });
}

// ============= Transactions =============
function addTransaction(txn) {
  return DB.push('/transactions', txn);
}
function getUserTransactions(email) {
  return DB.get('/transactions').then(function(data) {
    if (!data) return [];
    var arr = [];
    Object.keys(data).forEach(function(k) {
      if (data[k].userEmail === email) arr.push(Object.assign({ id: k }, data[k]));
    });
    return arr.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
  });
}

// ============= Auto Polling (Real-time-ish) =============
var _pollers = [];
function startPolling(fn, intervalMs) {
  var id = setInterval(fn, intervalMs || 5000);
  _pollers.push(id);
  return id;
}
function stopAllPolling() {
  _pollers.forEach(function(id){ clearInterval(id); });
  _pollers = [];
}

// ============= Utils =============
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
function nowISO() { return new Date().toISOString(); }
function formatBDT(n) { return '৳ ' + (parseFloat(n) || 0).toFixed(2); }
