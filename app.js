const express = require("express");
const { MongoClient } = require("mongodb");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const url = "mongodb://localhost:27017";
const dbName = "TopFlush";

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/public", express.static(__dirname + "/public"));
app.use(expressLayouts);
app.set("layout", "layout");

let db;

MongoClient.connect(url)
  .then((client) => {
    db = client.db(dbName);
    const collection = db.collection("restroom");
    collection
      .createIndex({ name: 1 }, { unique: true, background: true })
      .then(() => {
        console.log("Collection and index ensured.");
      })
      .catch((err) => {
        console.error("Error ensuring collection/index:", err);
      });
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000. Use Control + C to exit");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

app.use((req, res, next) => {
  const titles = {
    "/": "TopFlush",
    "/home": "Home Page",
    // ... other paths
  };
  res.locals.title = titles[req.path] || "Default Title";
  next();
});

app.get("/", async (req, res) => {
  try {
    const collection = db.collection("restroom");
    const data = await collection.find({}).toArray();
    res.render("index", { data }); 
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.get("/home", (req, res) => {
  res.render("home");
});