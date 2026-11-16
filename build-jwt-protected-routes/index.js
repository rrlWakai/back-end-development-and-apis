
const app = require("./server");

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log("----------------------------------");
  console.log("JWT Authentication API");
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("----------------------------------");
});
