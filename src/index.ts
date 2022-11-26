import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("oapa");
})

app.listen(process.env.PORT || 8000);