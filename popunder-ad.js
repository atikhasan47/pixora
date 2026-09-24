/* ==================================================
   POPUNDER + INTERSTITIAL AD SYSTEM
   Atik Daily Earning - User Panel
   ================================================== */

(function() {
  'use strict';

  var DB_URL = "https://atik-8be75-default-rtdb.asia-southeast1.firebasedatabase.app";
  var adSettings = {
    popunderInterval: 3,
    interstitialInterval: 5,
    adsterraPopunderScript: '',
    adsterraSocialBarScript: '',
    enabled: true
  };
  var popunderTimer = null;
  var interstitialTimer = null;
  var lastPopunderTime = 0;
  var lastInterstitialTime = 0;
  var adWindow = null;

  // ============= Load Settings from Firebase =============
  function loadAdSettings() {
    fetch(DB_URL + '/settings.json')
      .then(function(r) { return r.json(); })
      .then(function(s) {
        if (s) {
          adSettings.popunderInterval = parseInt(s.popunderInterval) || 3;
          adSettings.interstitialInterval = parseInt(s.interstitialInterval) || 5;
          adSettings.adsterraPopunderScript = s.adsterraPopunderScript || '';
          adSettings.adsterraSocialBarScript = s.adsterraSocialBarScript || '';
          adSettings.enabled = s.adsEnabled !== false;
        }
        startAdSystem();
      })
      .catch(function(e) {
        console.log('[Ad] Settings load failed, using defaults');
        startAdSystem();
      });
  }

  // ============= Start Ad System =============
  function startAdSystem() {
    if (!adSettings.enabled) return;
    injectSocialBar();
    startPopunderTimer();
    startInterstitialTimer();
    console.log('[Ad] System started - Popunder: ' + adSettings.popunderInterval + 'min, Interstitial: ' + adSettings.interstitialInterval + 'min');
  }

  // ============= Inject Adsterra Social Bar =============
  function injectSocialBar() {
    if (!adSettings.adsterraSocialBarScript) return;
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = adSettings.adsterraSocialBarScript;
    var scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(function(oldScript) {
      var newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.body.appendChild(newScript);
    });
  }

  // ============= Popunder Ad - Opens in new window =============
  function triggerPopunder() {
    if (!adSettings.enabled) return;
    var now = Date.now();
    if (now - lastPopunderTime < 30000) return; // Safety: min 30 sec gap
    lastPopunderTime = now;

    // Don't trigger if user is currently in Ad Overlay or Splash
    if (document.getElementById('adOverlay') && document.getElementById('adOverlay').classList.contains('active')) return;
    if (document.getElementById('splash') && !document.getElementById('splash').classList.contains('hide')) return;

    // Open Popunder in background (new tab/window)
    try {
      var popupUrl = 'about:blank';
      var w = window.open(popupUrl, '_blank', 'width=1,height=1,left=9999,top=9999');
      if (w) {
        w.blur();
        window.focus();
        // Popunder loaded - now inject Adsterra script
        if (adSettings.adsterraPopunderScript) {
          var html = '<!DOCTYPE html><html><head><title>Sponsored</title><style>body{margin:0;background:#000;}</style></head><body>' +
            adSettings.adsterraPopunderScript +
            '</body></html>';
          w.document.open();
          w.document.write(html);
          w.document.close();
        }
        console.log('[Ad] Popunder triggered');
      }
    } catch (e) {
      console.log('[Ad] Popunder failed:', e.message);
    }
  }

  // ============= Interstitial Ad - Full screen overlay =============
  function triggerInterstitial() {
    if (!adSettings.enabled) return;
    var now = Date.now();
    if (now - lastInterstitialTime < 60000) return; // Safety: min 1 min gap
    lastInterstitialTime = now;

    // Don't trigger if user is currently in Ad Overlay
    if (document.getElementById('adOverlay') && document.getElementById('adOverlay').classList.contains('active')) return;

    // Create a minimal interstitial overlay
    var overlay = document.createElement('div');
    overlay.id = 'interstitialAdOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99998;display:flex;justify-content:center;align-items:center;padding:20px;backdrop-filter:blur(8px);';

    var closeTimer = 5;
    var box = document.createElement('div');
    box.style.cssText = 'background:linear-gradient(135deg,#0d1b2a,#1b263b);border:3px solid #00E5FF;border-radius:22px;padding:25px;max-width:500px;width:100%;box-shadow:0 0 100px rgba(0,229,255,.6);text-align:center;position:relative;';
    box.innerHTML = 
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:12px;border-bottom:2px solid rgba(0,229,255,.3);">' +
        '<div style="color:#00E5FF;font-size:15px;font-weight:900;">📺 Sponsored</div>' +
        '<div id="interstitialTimer" style="background:linear-gradient(135deg,#FF1744,#D32F2F);color:#fff;padding:6px 14px;border-radius:20px;font-weight:900;font-size:14px;min-width:50px;">' + closeTimer + '</div>' +
      '</div>' +
      '<div id="interstitialSlot" style="background:#0a0f1e;border:2px dashed rgba(0,229,255,.4);border-radius:14px;padding:20px 10px;margin:15px 0;min-height:250px;display:flex;justify-content:center;align-items:center;overflow:hidden;"></div>' +
      '<button id="interstitialCloseBtn" disabled style="width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:900;cursor:pointer;font-family:inherit;background:#4a5568;color:#fff;opacity:.6;">⏳ অপেক্ষা করুন...</button>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Inject Adsterra Social Bar script into slot
    if (adSettings.adsterraSocialBarScript) {
      var slot = document.getElementById('interstitialSlot');
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = adSettings.adsterraSocialBarScript;
      var scripts = tempDiv.querySelectorAll('script');
      scripts.forEach(function(oldScript) {
        var newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
          newScript.async = true;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        slot.appendChild(newScript);
      });
    } else {
      document.getElementById('interstitialSlot').innerHTML = '<div style="color:#8fa8c4;font-size:14px;">Ad Loading...</div>';
    }

    var interval = setInterval(function() {
      closeTimer--;
      var t = document.getElementById('interstitialTimer');
      if (t) t.textContent = closeTimer;
      if (closeTimer <= 0) {
        clearInterval(interval);
        var btn = document.getElementById('interstitialCloseBtn');
        if (btn) {
          btn.disabled = false;
          btn.textContent = '✅ Close';
          btn.style.background = 'linear-gradient(90deg,#00E5FF,#0288D1)';
          btn.style.opacity = '1';
          btn.onclick = function() {
            var ov = document.getElementById('interstitialAdOverlay');
            if (ov) ov.remove();
            console.log('[Ad] Interstitial closed');
          };
        }
      }
    }, 1000);

    console.log('[Ad] Interstitial triggered');
  }

  // ============= Timers =============
  function startPopunderTimer() {
    if (popunderTimer) clearInterval(popunderTimer);
    var intervalMs = adSettings.popunderInterval * 60 * 1000;
    popunderTimer = setInterval(triggerPopunder, intervalMs);
    console.log('[Ad] Popunder timer: every ' + adSettings.popunderInterval + ' min');
  }

  function startInterstitialTimer() {
    if (interstitialTimer) clearInterval(interstitialTimer);
    var intervalMs = adSettings.interstitialInterval * 60 * 1000;
    interstitialTimer = setInterval(triggerInterstitial, intervalMs);
    console.log('[Ad] Interstitial timer: every ' + adSettings.interstitialInterval + ' min');
  }

  // ============= Public API (Admin can change from console) =============
  window.AdSystem = {
    reload: loadAdSettings,
    triggerPopunder: triggerPopunder,
    triggerInterstitial: triggerInterstitial,
    stop: function() {
      if (popunderTimer) clearInterval(popunderTimer);
      if (interstitialTimer) clearInterval(interstitialTimer);
      adSettings.enabled = false;
      console.log('[Ad] System stopped');
    }
  };

  // ============= Auto-start after page load =============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAdSettings);
  } else {
    setTimeout(loadAdSettings, 1000);
  }

  // ============= Re-load settings every 5 minutes =============
  setInterval(loadAdSettings, 5 * 60 * 1000);

})();
