const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;
const mongoose = require("mongoose");
const Produit = require("./Produit");

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose.set("strictQuery", true);
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost/produit-service");
        console.log("Produit-Service DB Connected");
    } catch (error) {
        console.error(`Erreur de connexion à la base de données: ${error.message}`);
        process.exit(1); // Arrêt de l'application si la connexion échoue
    }
};
connectDB();

// Route pour ajouter un produit
app.post("/produit/ajouter", async (req, res) => {
    try {
        const { nom, description, prix } = req.body;
        const newProduit = new Produit({ nom, description, prix });
        const produit = await newProduit.save();
        res.status(200).json(produits);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route pour récupérer des produits par ID
app.post("/produit/acheter", (req, res, next) => {
    const { ids } = req.body;
    console.log("Received ids:", ids);  // Log the received product IDs

    Produit.find({ _id: { $in: ids } })
        .then(produits => {
            if (produits.length === 0) {
                console.error("No products found for the provided ids:", ids);
                return res.status(404).json({ error: "No products found" });
            }
            res.status(200).json(produits);  // Send products as a successful response
            
            
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits:", error.message);
            console.error("Stack Trace:", error.stack);  // Log stack trace for debugging
            res.status(400).json({ error: "Erreur lors de la communication avec la base de données" });
        });
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Product-Service running at port ${PORT}`);
});
module.exports = app;
