const express = require("express");
const { MongoClient } = require("mongodb");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");

const Restroom = require("./models/restrooms");
const Review = require("./models/reviews");
const User = require("./models/users");

const app = express();
const url = "mongodb://localhost:27017";
const dbName = "TopFlush";

const authRoutes = require('./auth');

app.use('/auth', authRoutes);

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/public", express.static(__dirname + "/public"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

let db;

MongoClient.connect(url)
  .then((client) => {
    db = client.db(dbName);
    const collection = db.collection("restrooms");
    collection
      .createIndex({ name: 1 }, { unique: true, background: true })
      .then(() => {
        console.log("Collection and index ensured.");
      })
      .catch((err) => {
        console.error("Error ensuring collection/index:", err);
      });
    app.listen(3000, () => {
      console.log(
        "Server running on http://localhost:3000. Use Control + C to exit"
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  const titles = {
    "/": "TopFlush",
    "/home": "Home Page",
    "/createRestroom": "Create Restroom",
    // ... other paths
  };
  res.locals.title = titles[req.path] || "TopFlush";
  next();
});

app.get("/", async (req, res) => {
  try {
    const collection = db.collection("restrooms");
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

app.get("/createRestroom", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render("createRestroom");
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});


app.post("/createRestroom", async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const {
      address,
      city,
      state,
      capacity,
      hasBabyChangingTable,
      providesSanitaryProducts,
      customerOnly,
      dryer,
      cleanliness,
      accessibility,
      facility,
      text,
    } = req.body;

    const userId = req.session.user.id;

    const restroomData = {
      location: {
        address,
        city,
        state,
      },
      capacity,
      metrics: {
        hasBabyChangingTable,
        providesSanitaryProducts,
        customerOnly,
        dryer,
      },
    };

    const location = { address, city, state };
    await Restroom.addRestroom(restroomData);

    const restroomId = await Restroom.getRestroomByLocation(location);
    const reviewData = {
      restroomId,
      reviewerId: userId,
      text,
      metrics: {
        hasBabyChangingTable,
        providesSanitaryProducts,
        customerOnly,
        dryer,
      },
      ratingMetrics: {
        cleanliness,
        accessibility,
        facility,
      },
    };

    await Review.addReview(reviewData);
  } catch (err) {
    console.error(err);
    res.status(500).send(`
      <script>
        alert('${err.message}');
      </script>
    `);
  }
});
