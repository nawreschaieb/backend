const EventModel = require("../models/eventModel");

const searchEventController = async (req, res) => {
  try {
    const { titre, categorie, lieu } = req.query;
    
    // Création de la requête dynamique en fonction des filtres
    const query = {};
    if (titre) query.titre = new RegExp(titre, 'i'); // Recherche insensible à la casse
    if (categorie) query.categorie = categorie;
    if (lieu) query.lieu = new RegExp(lieu, 'i');
    
    // Recherche des événements selon les filtres
    const events = await EventModel.find(query);

    if (!events || events.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun événement trouvé.",
      });
    }

    res.status(200).send({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Erreur lors de la recherche d'événements.",
      error: error.message,
    });
  }
};

module.exports = { searchEventController };
