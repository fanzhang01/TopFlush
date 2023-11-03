const mongoose = require("mongoose");
const Restroom = require("./models/restrooms");

async function seedDB() {
  await Restroom.deleteMany({});

  const initRestroom = [
    {
      location: {
        address: "229 Washington St",
        city: "Hoboken",
        state: "NJ",
      },
      capacity: 3,
      rating: 4,
      ratingMetrics: {
        cleanliness: 4,
        accessibility: 5,
        facility: 3,
      },
      metrics: {
        isOpen: true,
        hasBabyChangingTable: true,
        providesSanitaryProducts: true,
        customerOnly: false,
        dryer: true,
      },
    },
    {
      location: {
        address: "UCC University Towers",
        city: "Hoboken",
        state: "NJ",
      },
      capacity: 6,
      rating: 5,
      ratingMetrics: {
        cleanliness: 5,
        accessibility: 5,
        facility: 5,
      },
      metrics: {
        isOpen: true,
        hasBabyChangingTable: false,
        providesSanitaryProducts: true,
        customerOnly: false,
        dryer: true,
      },
    },
    {
      location: {
        address: "4901 Bergenline Ave",
        city: "West New York",
        state: "NJ",
      },
      capacity: 3,
      rating: 3,
      ratingMetrics: {
        cleanliness: 3,
        accessibility: 3,
        facility: 3,
      },
      metrics: {
        isOpen: true,
        hasBabyChangingTable: true,
        providesSanitaryProducts: true,
        customerOnly: true,
        dryer: true,
      },
    },
  ];

  for (const restroom of initRestroom) {
    //console.log(restroom)
    await Restroom.addRestroom(restroom);
  }
}

module.exports = seedDB;