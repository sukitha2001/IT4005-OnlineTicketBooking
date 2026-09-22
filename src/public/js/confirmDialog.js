'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const confirmForms = document.querySelectorAll('.confirm-form');
  
  confirmForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const message = form.dataset.message || 'Are you sure you want to proceed?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
});
