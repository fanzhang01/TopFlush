const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

const Restroom = require("./models/restrooms");
const Review = require("./models/reviews");
const User = require("./models/users");
const seedDB = require('./seed');

const app = express();
const url = "mongodb://127.0.0.1:27017/TopFlush";

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/public", express.static(__dirname + "/public"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected via Mongoose.");
    seedDB()
      .then(() => {
        console.log("Database seeded");
      })
      .catch((err) => {
        console.log("Seeding failed:", err);
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
    const data = await Restroom.find({});
    res.render("index", { data });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password, gender } = req.body;
  console.log("USER: ", username);
  const user = new User({
    email,
    username,
    password,
    gender,
  });
  try {
    if (!username || !email || !password || !gender) {
      /*return res.status(400).redirect('/register', {
        error: 'All fields are required'
      }); */
      throw new Error("All fields are required");
    } else {
      await user.save();
      console.log("User added");
      res.redirect('/home');
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(`
    <script>
      alert('${error.message}');
    </script>
  `);
  }
});

module.exports = app;

app.get("/createRestroom", (req, res) => {
  res.render("createRestroom");
});

app.post("/createRestroom", async (req, res) => {
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
      reviewerId,
    } = req.body;

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

    await Restroom.create(restroomData);

    const restroomId = await Restroom.findOne({ "location.address": address });

    const reviewData = {
      restroomId,
      reviewerId,
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

    await Review.create(reviewData);

  } catch (err) {
    console.error(err);
    res.status(500).send(`
      <script>
        alert('${err.message}');
      </script>
    `);
  }
});