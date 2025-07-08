// Simple drag-and-drop for tier list
let draggedImg = null;

document.querySelectorAll('.tier-img').forEach(img => {
  img.addEventListener('dragstart', function (e) {
    draggedImg = this;
    setTimeout(() => this.style.display = "none", 0);
  });
  img.addEventListener('dragend', function (e) {
    this.style.display = "";
    draggedImg = null;
  });
});

document.querySelectorAll('.tier-row').forEach(row => {
  row.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  row.addEventListener('dragleave', function (e) {
    this.classList.remove('drag-over');
  });
  row.addEventListener('drop', function (e) {
    e.preventDefault();
    if (draggedImg) {
      this.appendChild(draggedImg);
    }
    this.classList.remove('drag-over');
  });
});
