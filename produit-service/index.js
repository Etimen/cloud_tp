const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;
const mongoose = require ("mongoose");
const Produit = require("./Produit");
// ------------------------------------------------
app.use(express.json())
//connection a la base de donnees MONGODB < publication-service-db>
//(Mongoose creer la base de donnes s il n'a trouve pas)
mongoose.set('strictQuery',true);
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost/produit-service", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Produit-Service DB Connected`);
    } catch (error) {
        console.error(`Erreur de connexion à la base de données: ${error.message}`);
        process.exit(1); // Stop the application if the database fails to connect
    }
};
connectDB();

app.post("/produit/ajouter",(req,res,next)=>{
    const  {nom,description,prix}=req.body;
    const newProduit = new  Produit({
        nom,
        description,
        prix
    });

//---------------------------------------------\\
    newProduit.save()
    .then(produit => res.status(201).json(produit))
    .catch(erro=>res.status(400).json({error}));
})
//--------------------------------------------------------------
app.get("/produit/acheter",(req,res,next)=>{
    const {ids} = req.body;
    Produit.find({_id:{$in:ids}})
    .then(produits=>res.status(201).json(produits))
    .catch(error => res.status(400).json({error}));
});
app.listen(PORT,()=>{
    console.log(`Product-Service at ${PORT}`)
}); 