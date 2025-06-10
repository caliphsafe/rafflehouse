import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, getDocs, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SUBMIT NEW RAFFLE
const form = document.getElementById('raffleForm');
const successMessage = document.getElementById('successMessage');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "raffles"), {
      name: form.productName.value,
      image: form.productImage.value,
      link: form.productLink.value,
      description: form.description.value,
      price: parseFloat(form.ticketPrice.value),
      totalTickets: parseInt(form.totalTickets.value),
      ticketsRemaining: parseInt(form.totalTickets.value),
    });
    form.reset();
    successMessage.classList.remove('hidden');
    setTimeout(() => successMessage.classList.add('hidden'), 2000);
    loadRaffles(); // reload after submit
  });
}

// LOAD RAFFLES + DELETE BUTTON
const raffleList = document.getElementById('raffleList');
async function loadRaffles() {
  raffleList.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, "raffles"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const raffleId = docSnap.id;
    const div = document.createElement('div');
    div.className = 'raffle-item';
    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.ticketsRemaining} of ${data.totalTickets} remaining</p>
      <button class="delete-btn" data-id="${raffleId}">Delete</button>
    `;
    div.querySelector('.delete-btn').addEventListener('click', () => {
      deleteDoc(doc(db, "raffles", raffleId));
      loadRaffles(); // refresh UI
    });
    raffleList.appendChild(div);
  });
}
loadRaffles();
