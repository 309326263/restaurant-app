import express from "express";
import io from "./index";

const app = express();
app.use(express.json());

app.post("/emit", (req, res) => {
  const { event, payload } = req.body;

  io.emit(event, payload);

  res.json({ ok: true });
});

app.listen(4000, () => {
  console.log("🌐 HTTP bridge en 4000");
});