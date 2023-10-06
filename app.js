import express from "express";
const app = express();

app.listen(3000, () => {
  console.log("Server running!");
  console.log("Your routes will be running on http://localhost:3000");
});