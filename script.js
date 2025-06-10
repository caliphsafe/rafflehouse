import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentRaffle = {};

const raffleFeed = document.getElementById("raffleFeed");
if (raffleFeed) {
  const querySnapshot = await getDocs(collection(db, "raffles"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const percentSold =
      100 - (data.ticketsRemaining / data.totalTickets) * 100;
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
          ${
            isClosed && data.winnerName
              ? `<p class="winner-text">🏆 Winner: ${data.winnerName}</p>`
              : `<button class="raffle-btn" onclick="openModal('${data.name}', '${docSnap.id}', ${data.price})">🎟 Enter Raffle</button>`
          }
        </div>
      </section>
    `;
    raffleFeed.innerHTML += cardHTML;
  });
}

window.openModal = function (title, id, price) {
  currentRaffle = { title, id, price };
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalPrice").innerText = price.toFixed(2);
  document.getElementById("purchaseModal").classList.remove("hidden");
};

window.closeModal = function () {
  document.getElementById("purchaseModal").classList.add("hidden");
  currentRaffle = {};
};

const confirmBtn = document.getElementById("confirmEntryBtn");
if (confirmBtn) {
  confirmBtn.addEventListener("click", async () => {
    const email = document.getElementById("userEmail").value.trim();
    const address = document.getElementById("userAddress").value.trim();
    const name = document.getElementById("userName").value.trim();

    if (!email || !address || !name) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const entryRef = collection(
        db,
        `raffles/${currentRaffle.id}/entries`
      );
      await addDoc(entryRef, {
        email,
        address,
        name,
        createdAt: new Date(),
      });

      const raffleDocRef = doc(db, "raffles", currentRaffle.id);
      await updateDoc(raffleDocRef, {
        ticketsRemaining: increment(-1),
      });

      closeModal();
      alert("You're in the raffle! 🎉");
      location.reload(); // Refresh to show updated ticket progress or winner
    } catch (err) {
      console.error("Error submitting entry:", err);
      alert("Something went wrong. Please try again.");
    }
  });
}
