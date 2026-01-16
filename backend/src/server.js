const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const childrenRouter = require("./routes/children");
const feedingsRouter = require("./routes/feedings");
const diapersRouter = require("./routes/diapers");


const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongo:27017";
const DB_NAME = process.env.DB_NAME || "tinycare";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/children", childrenRouter);
app.use("/api/feedings", feedingsRouter);
app.use("/api/diapers", diapersRouter);

let client;
let db;

async function getDb() {
    if (db) return db;

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);

    // быстрая проверка соединения
    await db.command({ ping: 1 });
    return db;
}

app.get("/api/health", async (req, res) => {
    try {
        const database = await getDb();
        const ping = await database.command({ ping: 1 });
        res.json({ ok: true, service: "tinycare-backend", db: ping.ok === 1 });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

(async () => {
    const database = await getDb();
    app.locals.db = database;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();

// корректное завершение (для Docker)
process.on("SIGINT", async () => {
    try { await client?.close(); } catch {}
    process.exit(0);
});
process.on("SIGTERM", async () => {
    try { await client?.close(); } catch {}
    process.exit(0);
});
