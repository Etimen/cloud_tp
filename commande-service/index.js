const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;
const mongoose = require("mongoose");
const Commande = require("./Commande")
const axios = require("axios");

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose.set("strictQuery", true);
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost/commande-service");
        console.log("Commande-Service DB Connected");
    } catch (error) {
        console.error(`Erreur de connexion à la base de données: ${error.message}`);
        process.exit(1); // Arrêt de l'application si la connexion échoue
    }
};
connectDB();

// Fonction pour calculer le prix total d'une commande
function prixTotal(produits) {
    const total = produits.reduce((sum, produit) => sum + produit.prix, 0);
    console.log("Prix total :", total);
    return total;
}

// Fonction pour récupérer les produits depuis le service produit
async function httpRequest(ids) {
    try {
        const URL = "http://localhost:4000/produit/acheter";  // Correct port
        const response = await axios.post(URL, { ids }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; // Returns the list of products
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error.message);
        console.error("Stack Trace:", error.stack); // debuger
        throw new Error("Erreur lors de la communication avec le service produit");
    }
}


// Route pour ajouter une commande
app.post("/commande/ajouter", async (req, res) => {
    try {
        const { ids, email_utilisateur } = req.body;

        console.log("Received data:", { ids, email_utilisateur });  // Log incoming data

        // Récupérer les produits via le service produit
        const produits = await httpRequest(ids);

        // Calculer le prix total
        const total = prixTotal(produits);

        // Créer une nouvelle commande
        const newCommande = new Commande({
            produits: ids,
            email_utilisateur,
            prix_total: total,
        });

        // Sauvegarder la commande dans la base de données
        const commande = await newCommande.save();
        res.status(201).json(commande);
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error.message);
        console.error("Stack Trace:", error.stack);  // Log stack trace for debugging
        res.status(400).json({ error: error.message });
    }
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Commande-Service running at port ${PORT}`);
});

module.exports = app;
