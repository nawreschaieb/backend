const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const registerController = async (req, res) => { 
  try {
    const { userName, email, phone, password, answer, role } = req.body;

    if (!userName || !email || !password || !phone || !answer || !role) {
      return res.status(400).send({
        success: false,
        message: "N’oubliez pas de remplir tous les champs, y compris le rôle !",
      });
    }

    const exisiting = await userModel.findOne({ email });
    if (exisiting) {
      return res.status(400).send({
        success: false,
        message: "Cette adresse e-mail est déjà utilisée, connectez-vous",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      userName,
      email,
      phone, 
      password: hashedPassword,
      answer,
      role, // ⬅️ Ajout ici
    });

    res.status(201).send({
      success: true,
      message: "Enregistrement réussi",
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erreur dans l’API d’inscription",
      error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "E-mail ou mot de passe requis",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Utilisateur introuvable",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Identifiants incorrects",
      });
    }
const token = JWT.sign({
  id: user._id,
  name: user.userName,
  role: user.role,       // ✅ Obligatoire !
  roles: user.roles || []
}, process.env.JWT_SECRET, {
  expiresIn: '1d',
});

    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "Authentification réussie",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erreur dans l’API de connexion",
      error,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Utilisateur introuvable",
      });
    }
    user.update_pass_date = new Date();
    await user.save();
    res.status(200).send({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Erreur dans l’API de déconnexion",
      error,
    });
  }
};

module.exports = { registerController, loginController, logoutController };
