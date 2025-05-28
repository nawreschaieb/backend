const express = require("express");
const router = express.Router();

const eventController = require('../controllers/eventController');
const searchEventController = require("../controllers/searchEventController");
const multer = require("multer");
const upload = multer({ dest: "tmp/" });



// Utilise bien eventController.createEventController dans la route avec multer
router.post('/createvents', upload.single('photo'), eventController.createEventController);

// Rechercher un événement
router.get('/search', searchEventController.searchEventController);

// Récupérer tous les événements
router.get('/getallevents', eventController.getAllEventsController);

// Récupérer un événement par ID
router.get('/getevents/:id', eventController.getSingleEventController);

// Mettre à jour un événement par ID
router.put('/modifierevents/:id', eventController.updateEventController);

// Supprimer un événement par ID
router.delete('/deletevents/:id', eventController.deleteEventController);

module.exports = router;
