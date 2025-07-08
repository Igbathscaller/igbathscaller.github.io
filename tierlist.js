let draggedImg = null;
let placeholderPosition = null; // "above" or "below"

function addDragEvents(img) {
  img.addEventListener('dragstart', function (e) {
    draggedImg = this;
    setTimeout(() => this.style.display = "none", 0);
  });
  img.addEventListener('dragend', function (e) {
    this.style.display = "";
    draggedImg = null;
    clearPlaceholders();
  });
}

function clearPlaceholders() {
  document.querySelectorAll('.tier-row').forEach(row => {
    row.classList.remove('placeholder-above', 'placeholder-below');
  });
}

function createTierRow() {
  const div = document.createElement('div');
  div.className = 'tier-row';
  // Set unique data-tier
  const tiers = document.querySelectorAll('.tier-row');
  div.dataset.tier = tiers.length + 1;
  addTierRowEvents(div);
  return div;
}

function addTierRowEvents(row) {
  // Drag over for above/below detection
  row.addEventListener('dragover', function (e) {
    e.preventDefault();
    const rect = this.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    clearPlaceholders();
    if (offset < rect.height / 2) {
      this.classList.add('placeholder-above');
      placeholderPosition = 'above';
    } else {
      this.classList.add('placeholder-below');
      placeholderPosition = 'below';
    }
  });

  row.addEventListener('dragleave', function (e) {
    clearPlaceholders();
  });

  row.addEventListener('drop', function (e) {
    e.preventDefault();
    clearPlaceholders();
    if (!draggedImg) return;

    // Insert image above or below the current tier
    const parent = this.parentNode;
    if (placeholderPosition === 'above') {
      // Insert new tier above
      const newTier = createTierRow();
      parent.insertBefore(newTier, this);
      newTier.appendChild(draggedImg);
    } else if (placeholderPosition === 'below') {
      // Insert new tier below
      const newTier = createTierRow();
      if (this.nextSibling) {
        parent.insertBefore(newTier, this.nextSibling);
      } else {
        parent.appendChild(newTier);
      }
      newTier.appendChild(draggedImg);
    }
    // After dropping, always ensure there's at least one empty tier at the bottom
    ensureEmptyTierAtEnd();
    removeEmptyTiers();
  });
}

function ensureEmptyTierAtEnd() {
  const tiers = document.querySelectorAll('.tier-row');
  const lastTier = tiers[tiers.length - 1];
  if (lastTier.children.length > 0) {
    const newTier = createTierRow();
    lastTier.parentNode.appendChild(newTier);
  }
}

function removeEmptyTiers() {
  const tiers = document.querySelectorAll('.tier-row');
  // Keep at least one tier at the end
  tiers.forEach((tier, idx) => {
    if (tier.children.length === 0 && idx < tiers.length - 1) {
      tier.parentNode.removeChild(tier);
    }
  });
}


// Initial setup
document.querySelectorAll('.tier-img').forEach(addDragEvents);
document.querySelectorAll('.tier-row').forEach(addTierRowEvents);