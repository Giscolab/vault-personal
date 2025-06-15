export class AutoLock {
  constructor(onLock, timeout = 300000) {
    this.onLock = onLock;
    this.timeout = timeout;
    this.timer = null;
    this.remaining = timeout;
    this.displayElement = document.getElementById('autolock-timer');

    this._reset = this._reset.bind(this);
    this._setupListeners();
    this._startTimer();
    this._startDisplay();
  }

  _setupListeners() {
    ['mousemove', 'keydown', 'click'].forEach(evt =>
      window.addEventListener(evt, this._reset)
    );
  }

  _startTimer() {
    this._clearTimer();
    this.remaining = this.timeout;

    this.timer = setTimeout(() => {
      this._stopDisplay();
      this.onLock();
    }, this.timeout);
  }

_startDisplay() {
  if (!this.displayElement) return;

  this._stopDisplay(); // Stoppe tout ancien timer

  const endTime = Date.now() + this.remaining;

  // Mise à jour immédiate dès affichage
  this._updateDisplay();

  this.displayInterval = setInterval(() => {
    this.remaining = endTime - Date.now();

    if (this.remaining <= 0) {
      this.remaining = 0;
      this._stopDisplay();
    }

    this._updateDisplay();
  }, 1000);
}


_stopDisplay() {
  this.displayElement.classList.remove('warning');
  clearInterval(this.displayInterval);
  this.displayInterval = null;
  // ⛔️ on ne vide plus textContent ici → il reste visible
}

// mise à jour de l'affichage
_updateDisplay() {
  const minutes = Math.floor(this.remaining / 60000);
  const seconds = Math.floor((this.remaining % 60000) / 1000);
	this.displayElement.innerHTML = `<i class="fas fa-lock"></i> Verrouillage auto dans ${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  if (this.remaining <= 10000) {
    this.displayElement.classList.add('warning');
  } else {
    this.displayElement.classList.remove('warning');
  }
}

lockVault() {
  vaultManager.masterKey = null;
  console.log("[LOCK] Clé supprimée ? ", vaultManager.masterKey === null);
  showAuthScreen();
  // SÉCURITÉ : on vide le champ mot de passe maître
  const pwInput = document.getElementById('master-password');
  if (pwInput) pwInput.value = '';
  showToast('Session verrouillée automatiquement.', 'error');
}


_reset() {
  this._startTimer();
  this._stopDisplay();
  this._startDisplay();
}

  _clearTimer() {
    if (this.timer) clearTimeout(this.timer);
  }

  stop() {
    this._clearTimer();
    this._stopDisplay();
    ['mousemove', 'keydown', 'click'].forEach(evt =>
      window.removeEventListener(evt, this._reset)
    );
  }
}
