const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nbPlaces: { type: Number, required: true, min: 1 },
  modePaiement: { type: String, required: true, enum: ["carte", "espece", "paypal"] },
  dateReservation: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reservation", reservationSchema); 