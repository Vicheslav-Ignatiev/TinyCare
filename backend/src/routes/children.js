const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

// GET /api/children
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;
        const items = await db
            .collection("children")
            .find({})
            .sort({ _id: -1 })
            .toArray();

        return res.json({ ok: true, data: items });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to load tinys" },
        });
    }
});

// POST /api/children
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                ok: false,
                error: { message: "Name is required" },
            });
        }

        const db = req.app.locals.db;
        const doc = { name: name.trim() };

        const result = await db.collection("children").insertOne(doc);

        return res.status(201).json({
            ok: true,
            data: { _id: result.insertedId, name: doc.name },
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to create tiny" },
        });
    }
});

// DELETE /api/children/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid id" },
            });
        }

        const db = req.app.locals.db;
        await db.collection("children").deleteOne({ _id: new ObjectId(id) });

        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to delete tiny" },
        });
    }
});

module.exports = router;
