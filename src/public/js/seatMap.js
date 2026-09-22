'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const seatMap = document.getElementById('seatMap');
  if (!seatMap) return;

  const selectedList = document.getElementById('selectedList');
  const totalAmountEl = document.getElementById('totalAmount');
  const seatInputs = document.getElementById('seatInputs');
  const confirmBtn = document.getElementById('confirmBtn');

  const selectedSeats = new Map();

  seatMap.addEventListener('click', (e) => {
    const seatBtn = e.target.closest('.seat');
    if (!seatBtn || seatBtn.disabled) return;

    const id = seatBtn.dataset.id;
    const price = parseFloat(seatBtn.dataset.price);
    const label = seatBtn.dataset.label;
    const type = seatBtn.dataset.type;

    if (selectedSeats.has(id)) {
      selectedSeats.delete(id);
      seatBtn.classList.remove('selected');
      seatBtn.setAttribute('aria-pressed', 'false');
    } else {
      selectedSeats.set(id, { id, price, label, type });
      seatBtn.classList.add('selected');
      seatBtn.setAttribute('aria-pressed', 'true');
    }

    updateSummary();
  });

  function updateSummary() {
    // Update List
    if (selectedSeats.size === 0) {
      selectedList.innerHTML = '<li>No seats selected</li>';
    } else {
      selectedList.innerHTML = Array.from(selectedSeats.values())
        .map(s => `<li>${s.label} (${s.type}) - LKR ${s.price.toFixed(2)}</li>`)
        .join('');
    }

    // Update Total
    const total = Array.from(selectedSeats.values()).reduce((sum, s) => sum + s.price, 0);
    totalAmountEl.textContent = `LKR ${total.toFixed(2)}`;

    // Update Hidden Inputs for Form
    if (seatInputs) {
      seatInputs.innerHTML = Array.from(selectedSeats.keys())
        .map(id => `<input type="hidden" name="showSeatIds" value="${id}">`)
        .join('');
    }

    // Toggle Button
    if (confirmBtn) {
      confirmBtn.disabled = selectedSeats.size === 0;
    }
  }
});
