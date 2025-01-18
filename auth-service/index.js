const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4002;
const mongoose = require("mongoose");
const Utilisateur = require("./Utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Connexion à la base de données
mongoose.set("strictQuery", true);
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost/auth-service");
        console.log("Auth-Service DB Connected");
    } catch (error) {
        console.error("Erreur de connexion à la base de données : ${error.message}");
        process.exit(1); // Arrêter l'application si la connexion échoue
    }
};
connectDB();

// Middleware pour parser le JSON
app.use(express.json());

// Route pour enregistrer un utilisateur
app.post("/auth/register", async (req, res) => {
    try {
        let { nom, email, mot_passe } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await Utilisateur.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(mot_passe, 10);

        // Création d'un nouvel utilisateur
        const newUtilisateur = new Utilisateur({
            nom,
            email,
            mot_passe: hashedPassword,
        });

        const utilisateur = await newUtilisateur.save();
        res.status(201).json(utilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour connecter un utilisateur
app.post("/auth/login", async (req, res) => {
    try {
        const { email, mot_passe } = req.body;

        // Vérification si l'utilisateur existe
        const utilisateur = await Utilisateur.findOne({ email });
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        // Comparaison des mots de passe
        const isPasswordValid = await bcrypt.compare(mot_passe, utilisateur.mot_passe);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        // Génération du token JWT
        const payload = {
            email: utilisateur.email,
            nom: utilisateur.nom,
        };
        const token = jwt.sign(payload, "secret", { expiresIn: "1h" }); // Token expirant après 1 heure

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Auth-Service running at port ${PORT}`);
});