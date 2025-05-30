const cloudinary = require('../utils/cloudinary');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    // Récupérer le dossier spécifié dans la requête
    const folder = req.body.folder || 'uploads';
    
    console.log(`Folder path received from client: ${folder}`);
    
    // Configuration pour l'upload à Cloudinary
    const cloudinaryOptions = {
      folder: folder,  // Ceci est correct, Cloudinary accepte les chemins hiérarchiques
      resource_type: 'image',
      // Vous pouvez ajouter d'autres options ici selon vos besoins
    };
    
    // Upload à Cloudinary avec le dossier spécifié
    const result = await cloudinary.uploader.upload(req.file.path, cloudinaryOptions);
    
    console.log(`Uploaded to Cloudinary. Public ID: ${result.public_id}`);
    
    // Renvoyer les informations de l'image
    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      // Autres informations si nécessaire
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