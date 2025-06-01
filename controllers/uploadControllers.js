// uploadControllers.js
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const folder = req.body.folder || 'uploads';

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: 'auto',
      type: 'private'
    });

    fs.unlinkSync(req.file.path); // supprimer le fichier temporaire

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error("Erreur lors de l'upload :", err);
    return res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
};



exports.getSignedImageUrl = async (req, res) => {
  const publicId = req.params.public_id;

  try {
    // Vérifier si le publicId contient une extension
    const parts = publicId.split('.');
    let extension = '';
    let actualPublicId = publicId;

    // S'il y a une extension
    if (parts.length > 1) {
      extension = parts.pop(); // Obtenir l'extension
      actualPublicId = parts.join('.'); // Reconstruire le publicId sans l'extension
    }

    // Options pour l'URL signée
    const options = {
      expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
    };

    // Générer l'URL signée
    const signedUrl = cloudinary.utils.private_download_url(actualPublicId, extension, options);

    return res.json({ signedUrl });
  } catch (err) {
    console.error("Erreur lors de la génération de l'URL signée :", err);
    return res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
};