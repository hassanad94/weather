const express = require("express");
const path = require("path");

const app = express();

const options = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["htm", "html"],
  index: false,
  maxAge: "7d",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now());
  },
};

app.use(express.static("public", options));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/main.html"));
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
