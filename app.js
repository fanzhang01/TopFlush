const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

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
    cookie: { secure: false } 
  })
);

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    
    let userId = req.session.userId;
    let tempFilePath = "public/storage/" + userId;
    req.body.tempFilePath = "/" + tempFilePath + "/" + file.originalname;
    fs.mkdirSync(tempFilePath, { recursive: true });
    cb(null, tempFilePath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let upload = multer({ storage: storageConfig });

// !!! Don't remove this part, this is used to test ipgeolocation.
// app.use(async (req, res, next) => {
//   req.session.location = "Test Location, Test State, Test Country";
//   console.log('Session after setting test location:', req.session);
//   next();
// });

app.use(async (req, res, next) => {
  try {
    // !!! Don't remove this part. Will use the following code when the project is online. 
    // const ip = req.connection.remoteAddress || req.socket.remoteAddress;
    // const formattedIp = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
    // const location = await fetchLocation(formattedIp);

    // !!! Don't remove this part, this is used to test ipgeolocation.
    // $ curl https://api.ipgeolocation.io/ipgeo\?apiKey\=0747a801940b4186b2b5008978c849b9\&ip\=155.246.151.38
    // {"ip":"155.246.151.38","continent_code":"NA","continent_name":"North America","country_code2":"US","country_code3":"USA","country_name":"United States","country_name_official":"United States of America","country_capital":"Washington, D.C.","state_prov":"New Jersey","state_code":"US-NJ","district":"","city":"Hoboken","zipcode":"07030","latitude":"40.74679","longitude":"-74.02503","is_eu":false,"calling_code":"+1","country_tld":".us","languages":"en-US,es-US,haw,fr","country_flag":"https://ipgeolocation.io/static/flags/us_64.png","geoname_id":"5096343","isp":"Stevens Institute of Technology","connection_type":"","organization":"Stevens Institute of Technology","currency":{"code":"USD","name":"US Dollar","symbol":"$"},"time_zone":{"name":"America/New_York","offset":-5,"offset_with_dst":-5,"current_time":"2023-11-09 17:31:13.483-0500","current_time_unix":1699569073.483,"is_dst":false,"dst_savings":0}}%   

    const testIp = "155.246.151.38";
    const location = await fetchLocation(testIp);

    if (location) {
      console.log(`Location fetched successfully: ${location}`);
      req.session.location = location;
      console.log('Session location set:', req.session.location); // Confirming session location
    } else {
      console.log("Failed to fetch location");
    }
  } catch (error) {
    console.error('Error fetching location:', error);
  }
  next();
});

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
    console.log('Session data in /home:', req.session);
    const restroomsInNJ = await Restroom.find({ "location.state": "NJ" });
    res.render("home", {
      restrooms: restroomsInNJ,
      username: req.session.username,
      location: req.session.location
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
      req.session.username = user.username;
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
      res.render("restroom", { restroomId:restroomId,restroom:restroom,username: req.session.username });
    } else {
      // If no restroom is found, send a 404 response with the message "Restroom not found" and its id
      res.status(404).send(`Restroom not found with id ${restroomId}`);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/restroom/:id/review",async(req,res)=>{
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try{
    const userId = req.session.userId;
    const restroomId = req.params.id;
    const { text, rating, cleanliness, accessibility, facility, isOpen, hasBabyChangingTable, providesSanitaryProducts, customerOnly, dryer } = req.body;
    const ratingMetrics = { cleanliness, accessibility, facility };
    const metrics = { isOpen, hasBabyChangingTable, providesSanitaryProducts, customerOnly, dryer };
    await Review.addReview({
      restroomId: restroomId,
      userId: userId,
      text: text,
      rating: rating,
      ratingMetrics: ratingMetrics,
      metrics: metrics
    });

    res.redirect(`/restroom/${restroomId}`);
  }catch (err) {
    res.status(500).send(err.message);
  }
})

app.get("/createRestroom", (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render("createRestroom");
});

app.post("/createRestroom", upload.single("reviewImage"), async (req, res) => {
  console.log("req.file: ", req.file);

  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    console.log("getting into router");

    // Extracting data from the request
    const { location, capacity, metrics, ratingMetrics, text } = req.body;
    const userId = req?.session?.userId;

    // Process checkbox values
    for (const key in metrics) {
      metrics[key] = metrics[key] === "true";
    }

    // Calculate overall rating
    const rating = (parseFloat(ratingMetrics.cleanliness) +
                    parseFloat(ratingMetrics.accessibility) +
                    parseFloat(ratingMetrics.facility)) / 3;
    console.log('rating is:', rating);

    // Prepare restroom data for creation
    const restroomData = {
      location: {
        address: location.address,
        latitude: parseFloat(location?.latitude || 0.0),
        longitude: parseFloat(location?.longitude || 0.0),
        city: location.city,
        state: location.state,
      },
      capacity: parseInt(capacity, 10 || 0.0),
      rating,
      ratingMetrics: {
        cleanliness: parseFloat(ratingMetrics.cleanliness),
        accessibility: parseFloat(ratingMetrics.accessibility),
        facility: parseFloat(ratingMetrics.facility),
      },
      metrics,
      pathToImage: req.body.tempFilePath //? req.file.path : null // Assuming 'req.file.path' contains the path to the uploaded image
    };

    console.log("restroomData:", restroomData);
    await Restroom.create(restroomData);

    console.log("restroom created");
    const createdRestroom = await Restroom.findOne({ "location.address": location.address });

    // Prepare review data for creation
    const reviewData = {
      restroomId: createdRestroom._id,
      reviewerId: userId,
      text,
      metrics,
      ratingMetrics,
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
    const restrooms = await Restroom.find();
    res.render("restrooms", { restrooms });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (user) {
      res.render("profile", { user: user,username: req.session.username });
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

const fetchLocation = async (ip) => {
  try {
    // Here I used my apiKey
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=0747a801940b4186b2b5008978c849b9&ip=${ip}`);
    const data = await response.json();
    console.log(`API response for IP ${ip}:`, data);

    const location = `${data.city}, ${data.state_prov}, ${data.country_name}`;
    console.log(`Fetched location for IP ${ip}:`, location);
    return location;
  } catch (error) {
    console.error('Error in fetchLocation:', error);
    return null;
  }
};


