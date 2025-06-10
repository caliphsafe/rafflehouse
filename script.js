import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ADMIN FORM LOGIC
const form = document.getElementById('raffleForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, "raffles"), {
      name: form.productName.value,
      image: form.productImage.value,
      link: form.productLink.value,
      description: form.description.value,
      price: parseFloat(form.ticketPrice.value),
      totalTickets: parseInt(form.totalTickets.value),
      ticketsRemaining: parseInt(form.totalTickets.value),
    });
    form.reset();
    document.getElementById('successMessage').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('successMessage').classList.add('hidden');
    }, 3000);
  });
}

// HOMEPAGE RAFFLE FEED LOGIC
const raffleFeed = document.getElementById('raffleFeed');
if (raffleFeed) {
  const querySnapshot = await getDocs(collection(db, "raffles"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const percentSold = 100 - (data.ticketsRemaining / data.totalTickets) * 100;

    const isClosed = data.raffleClosed === true;
    const cardHTML = `
      <section class="raffle-card">
        <img src="${data.image}" alt="Product" class="product-img">
        <div class="raffle-info">
          <h2>${data.name}</h2>
          <p>$${data.price.toFixed(2)} per ticket</p>
          <div class="progress-wrapper">
            <div class="progress-bar" style="width: ${percentSold}%"></div>
          </div>
          <p><strong>${data.ticketsRemaining} of ${data.totalTickets} tickets remaining</strong></p>
          ${isClosed && data.winnerName
            ? `<p class="winner-text">🏆 Winner: ${data.winnerName}</p>`
            : `<button class="raffle-btn" onclick="openModal('${data.name}', ${data.price})">🎟 Enter Raffle</button>`}
        </div>
      </section>
    `;
    raffleFeed.innerHTML += cardHTML;
  });
}

// MODAL LOGIC
window.openModal = function(title, price) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalPrice").innerText = price.toFixed(2);
  document.getElementById("purchaseModal").classList.remove("hidden");
};

window.closeModal = function() {
  document.getElementById("purchaseModal").classList.add("hidden");
};
