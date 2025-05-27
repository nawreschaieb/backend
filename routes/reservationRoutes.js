const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middlewares/authMiddleware"); // à adapter selon ton projet

// Créer une réservation
router.post("/", authMiddleware, reservationController.createReservation);

// Voir les réservations de l'utilisateur connecté
router.get("/mes-reservations", authMiddleware, reservationController.getUserReservations);

module.exports = router; 