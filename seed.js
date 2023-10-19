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
      metrics: {
        isOpen: true,
        hasBabyChangingTable: false,
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
      metrics: {
        isOpen: true,
        hasBabyChangingTable: false,
      },
    },
  ];

  for (const restroom of initRestroom) {
    await Restroom.addRestroom(restroom);
  }

}

module.exports = seedDB;