let draggedImg = null;
let placeholderPosition = null; // "above", "below", or null

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
    row.querySelectorAll('.tier-img').forEach(img => {
      img.classList.remove('insert-left', 'insert-right', 'highlight-pair');
    });
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
  row.addEventListener('dragover', function (e) {
    e.preventDefault();
    clearPlaceholders();

    const rect = this.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const aboveThreshold = -20; // 20px above the box
    const belowThreshold = rect.height + 20; // 20px below the box

    placeholderPosition = null;
    row._insertBeforeImg = null;
    row._highlightPair = null;

    if (offsetY < 20 && offsetY >= aboveThreshold) {
      this.classList.add('placeholder-above');
      placeholderPosition = 'above';
      return;
    } else if (offsetY > rect.height - 20 && offsetY <= belowThreshold) {
      this.classList.add('placeholder-below');
      placeholderPosition = 'below';
      return;
    }

    // In-row logic: find where between images
    const images = Array.from(this.querySelectorAll('.tier-img'));
    const range = 40; // px, controls how close to edge or between

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const imgRect = img.getBoundingClientRect();
      const mid = imgRect.left + imgRect.width / 2;

      // On left edge of first image
      if (i === 0 && e.clientX < imgRect.left + range) {
        img.classList.add('insert-left');
        row._insertBeforeImg = img;
        break;
      }
      // On right edge of last image
      if (i === images.length - 1 && e.clientX > imgRect.right - range) {
        img.classList.add('insert-right');
        row._insertBeforeImg = img.nextSibling;
        break;
      }
      // Between two images
      if (i < images.length - 1) {
        const nextImg = images[i + 1];
        const nextRect = nextImg.getBoundingClientRect();
        if (e.clientX > imgRect.right - range && e.clientX < nextRect.left + range) {
          img.classList.add('highlight-pair');
          nextImg.classList.add('highlight-pair');
          row._insertBeforeImg = nextImg;
          row._highlightPair = [img, nextImg];
          break;
        }
      }
      // On left/right half of an image
      if (e.clientX >= imgRect.left && e.clientX <= imgRect.right) {
        if (e.clientX < mid) {
          img.classList.add('insert-left');
          row._insertBeforeImg = img;
        } else {
          img.classList.add('insert-right');
          row._insertBeforeImg = img.nextSibling;
        }
        break;
      }
    }
    // If not over any image, will append to end
  });

  row.addEventListener('dragleave', function (e) {
    clearPlaceholders();
  });

  row.addEventListener('drop', function (e) {
    e.preventDefault();
    clearPlaceholders();
    if (!draggedImg) return;

    const parent = this.parentNode;

    if (placeholderPosition === 'above') {
      const newTier = createTierRow();
      parent.insertBefore(newTier, this);
      newTier.appendChild(draggedImg);
    } else if (placeholderPosition === 'below') {
      const newTier = createTierRow();
      if (this.nextSibling) {
        parent.insertBefore(newTier, this.nextSibling);
      } else {
        parent.appendChild(newTier);
      }
      newTier.appendChild(draggedImg);
    } else if (this._insertBeforeImg) {
      this.insertBefore(draggedImg, this._insertBeforeImg);
    } else {
      this.appendChild(draggedImg);
    }
    this._insertBeforeImg = null;
    this._highlightPair = null;
    removeEmptyTiers();
    placeholderPosition = null;
  });
}

function removeEmptyTiers() {
  const tiers = document.querySelectorAll('.tier-row');
  // Remove all empty tiers except the last one if *all* are empty
  let nonEmptyCount = 0;
  tiers.forEach(tier => {
    if (tier.children.length > 0) nonEmptyCount++;
  });
  tiers.forEach((tier, idx) => {
    if (tier.children.length === 0 && (nonEmptyCount > 0 || idx < tiers.length - 1)) {
      tier.parentNode.removeChild(tier);
    }
  });
}

// Initial setup
document.querySelectorAll('.tier-img').forEach(addDragEvents);
document.querySelectorAll('.tier-row').forEach(addTierRowEvents);