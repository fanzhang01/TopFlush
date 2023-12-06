const mongoose = require("mongoose");
const Restroom = require("./models/restrooms");

async function seedDB() {
  await Restroom.deleteMany({});

  const initRestroom = [
    {
      location: {
        address: "229 Washington St Public Restroom",
        city: "Hoboken",
        state: "NJ",
        latitude: 40.739620,
        longitude: -74.030000
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
      pathToImage: "/public/storage/229.jpeg",
    },
    {
      location: {
        address: "UCC University Towers Public Restroom",
        city: "Hoboken",
        state: "NJ",
        latitude: 40.7441753,
        longitude: -74.0245282,
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
      pathToImage: "/public/storage/ucc.jpeg",
    },
    {
      location: {
        address: "4901 Bergenline Ave Public Restroom",
        city: "West New York",
        state: "NJ",
        latitude: 40.753500,
        longitude: -74.041500
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
      pathToImage: "/public/storage/4901.jpeg",
    },
  ];

  for (const restroom of initRestroom) {
    await Restroom.addRestroom(restroom);
  }
}

module.exports = seedDB;
