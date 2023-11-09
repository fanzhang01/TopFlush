const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

const Restroom = require("./models/restrooms");
const Review = require("./models/reviews");
const User = require("./models/users");
const seedDB = require("./seed");

const app = express();
const url = "mongodb://127.0.0.1:27017/TopFlush";

const authRoutes = require('./auth');

app.use('/auth', authRoutes);

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/public", express.static(__dirname + "/public"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(session({
//   secret: 'your secret key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }));

// let db;

// MongoClient.connect(url)
//   .then((client) => {
//     db = client.db(dbName);
//     const collection = db.collection("restrooms");
//     collection
//       .createIndex({ name: 1 }, { unique: true, background: true })

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

app.use(
  session({
    secret: "justSomeRandomSecretString",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(async (req, res, next) => {
  res.locals.user = res.locals.user || {};
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        res.locals.user = user;
      } else {
        delete req.session.userId;
      }
    } catch (err) {
      console.log(err);
    }
  }
  next();
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
    const data = await Restroom.find({});
    res.render("index", { data });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.get("/home", async (req, res) => {
  try {
    const restroomsInNJ = await Restroom.find({ "location.state": "NJ" });
    res.render("home", {
      restrooms: restroomsInNJ,
      username: req.session.username  // Pass the username to the template
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/home");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });

    if (user) {
      req.session.userId = user._id;
      req.session.username = user.username;  // Store the username in the session
      res.redirect("/home");
    } else {
      res.status(401).send("Invalid username or password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password, confirmedpassword, gender } = req.body;
  console.log("USER: ", username);
  const user = new User({
    email,
    username,
    password,
    gender,
  });
  try {
    if (confirmedpassword !== password) {
      throw new Error("Passwords do not match");
    }
    if (!username || !email || !password || !gender) {
      /*return res.status(400).redirect('/register', {
        error: 'All fields are required'
      }); */
      throw new Error("All fields are required");
    } else {
      await user.save();
      console.log("User added");
      res.redirect("/home");
    }
  } catch (error) {
    console.error(error);
    res.status(400).render('register', { error: error.message });
  }
});

module.exports = app;

app.get("/restroom/:id", async (req, res) => {
  const restroomId = req.params.id;
  try {
    const restroom = await Restroom.findById(restroomId);
    if (restroom) {
      console.log(restroom);
      res.render("restroom", { restroom });
    } else {
      // If no restroom is found, send a 404 response with the message "Restroom not found" and its id
      res.status(404).send(`Restroom not found with id ${restroomId}`);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
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
    console.log("getting into router");
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

    const metrics = req.body.metrics;

    for (const key in metrics) {
      if (Array.isArray(metrics[key])) {
        metrics[key] = metrics[key].includes("true");
      } else {
        metrics[key] = metrics[key] === "true";
      }
    }

    console.log("req.body: ", req.body);
    const rating =
      (parseFloat(req.body.ratingMetrics.cleanliness) +
        parseFloat(req.body.ratingMetrics.accessibility) +
        parseFloat(req.body.ratingMetrics.facility)) /
      3;
    console.log('rating is:', rating);
    console.log(req.body.ratingMetrics.cleanliness);
    const restroomData = {
      location: {
        address: req.body.location.address,
        city: req.body.location.city,
        state: req.body.location.state,
      },
      capacity: req.body.capacity,
      rating,
      ratingMetrics: {
        cleanliness: req.body.ratingMetrics.cleanliness,
        accessibility: req.body.ratingMetrics.accessibility,
        facility: req.body.ratingMetrics.facility,
      },
      metrics: {
        hasBabyChangingTable: req.body.metrics.hasBabyChangingTable,
        providesSanitaryProducts: req.body.metrics.providesSanitaryProducts,
        customerOnly: req.body.metrics.customerOnly,
        dryer: req.body.metrics.dryer,
      },
    };

    console.log("restroomData:", restroomData);
    await Restroom.create(restroomData);

    console.log("restroom created");
    const restroomId = await Restroom.findOne({ "location.address": address });

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

    await Review.create(reviewData);
    console.log("review created");

    res.status(200).send(`
      <script>
        alert('Successfully created restroom and review.');
        window.location.href = '/home';
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send(`
      <script>
        alert('${err.message}');
      </script>
    `);
  }
});

app.get("/restrooms", async (req, res) => {
  try {
    const restrooms = await Restroom.find(); // Query all entries from the restrooms collection
    res.render("restrooms", { restrooms }); // Render the restrooms view with the queried data
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }
  try {
    const user = await User.findById(req.session.userId);
    if (user) {
      res.render("profile", { user: user });
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
