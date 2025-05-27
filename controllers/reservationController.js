const Reservation = require("../models/reservationModel");

// Créer une réservation
exports.createReservation = async (req, res) => {
  try {
    const { event, nbPlaces, modePaiement } = req.body;
    const user = req.user._id; // suppose que l'utilisateur est authentifié

    if (!event || !nbPlaces || !modePaiement) {
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants." });
    }

    const reservation = new Reservation({ event, user, nbPlaces, modePaiement });
    await reservation.save();

    res.status(201).json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la réservation.", error: error.message });
  }
};

// Voir toutes les réservations d'un utilisateur
exports.getUserReservations = async (req, res) => {
  try {
    const user = req.user._id;
    const reservations = await Reservation.find({ user }).populate("event");
    res.status(200).json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur.", error: error.message });
  }
}; 