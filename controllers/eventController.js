const EventModel = require("../models/eventModel");
const APIFeatures = require("../utils/APIF");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Pour la gestion upload, tu dois configurer multer dans ton router ou serveur principal
// Exemple rapide (à mettre dans ta config express, pas ici) :
// const multer = require("multer");
// const upload = multer({ dest: "tmp/" }); // dossier temporaire pour fichiers
// router.post('/events', upload.single('photo'), createEventController);

const createEventController = async (req, res) => {
  try {
const { titre, prix, date, region, lieu, image, categorie } = req.body;

  

    // Validation basique obligatoire
    if (!titre || !prix || !date || !region || !lieu || !categorie) 
      {
      return res.status(400).json({
        success: false,
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Validation prix > 0
    if (isNaN(prix) || Number(prix) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le prix doit être un nombre strictement supérieur à 0.",
      });
    }

    // Validation date valide et pas dans le passé
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "La date fournie est invalide.",
      });
    }
    if (eventDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "La date de l'événement ne peut pas être dans le passé.",
      });
    }

    // Gestion upload image (optionnel
    let photoFilename = null;
    if (req.file) {
      const uploadDir = path.join(__dirname, "../upload");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Construire un nom de fichier unique sécurisé (sans variable non définie)
      const uniqueFilename = `${Date.now()}-${titre.replace(/\s+/g, '_')}${path.extname(req.file.originalname)}`;
      const newFilePath = path.join(uploadDir, uniqueFilename);

      // Déplacer le fichier de tmp vers upload
      fs.renameSync(req.file.path, newFilePath);

      photoFilename = uniqueFilename;
    }

    // Création de l'événement
   const newEvent = new EventModel({
  titre,
  lieu,
  prix,
  region,
  categorie,
  date: eventDate,
  image: Array.isArray(image)
    ? image.map((img) => ({
        url: img.url || img.imageUrl || img,
        public_id: img.public_id || "",
      }))
    : image
    ? [{ url: image, public_id: "" }]
    : [],
});


    await newEvent.save();

    return res.status(201).json({
      success: true,
      message: "Événement créé avec succès.",
      event: newEvent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'événement.",
      error: error.message,
    });
  }
};

const getAllEventsController = async (req, res) => {
  try {
    // Pagination, filtrage, tri via APIFeatures
    const features = new APIFeatures(EventModel.find(), req.query)
      .filter()
      .sort()
      .pagination();

    const events = await features.query.lean();

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun événement trouvé.",
      });
    }

    // Exemple : suppression champ sensible s’il existe
    events.forEach(event => {
      delete event.seller;
    });

    return res.status(200).json({
      success: true,
      totalEvents: events.length,
      events,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des événements.",
      error: error.message,
    });
  }
};

const getSingleEventController = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'événement invalide.",
      });
    }

    const event = await EventModel.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Aucun événement trouvé avec cet ID.",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'événement.",
      error: error.message,
    });
  }
};

const updateEventController = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'événement invalide.",
      });
    }

    // Optionnel : validation des champs à mettre à jour (à adapter selon besoin)

    const updates = req.body;

    // Si mise à jour date ou prix, re-validation possible ici

    const updatedEvent = await EventModel.findByIdAndUpdate(eventId, updates, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Aucun événement trouvé avec cet ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Événement mis à jour avec succès.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'événement.",
      error: error.message,
    });
  }
};

const deleteEventController = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'événement invalide.",
      });
    }

    const deletedEvent = await EventModel.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Aucun événement trouvé avec cet ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Événement supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'événement.",
      error: error.message,
    });
  }
};

module.exports = {
  createEventController,
  getAllEventsController,
  getSingleEventController,
  updateEventController,
  deleteEventController,
};
