const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  prix: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  region: { type: String, required: true },
  lieu: { type: String, required: true },
  image: { type: String }, // URL ou nom du fichier
  categorie: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
