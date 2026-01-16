const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

// POST /api/diapers
router.post("/", async (req, res) => {
    try {
        const { babyId, changedAt, isPoop } = req.body;

        // Validation
        if (!ObjectId.isValid(babyId)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid baby ID" }
            });
        }

        if (isPoop === undefined || isPoop === null) {
            return res.status(400).json({
                ok: false,
                error: { message: "isPoop is required" }
            });
        }

        const db = req.app.locals.db;

        const doc = {
            babyId: new ObjectId(babyId),
            changedAt: changedAt ? new Date(changedAt) : new Date(),
            isPoop: Boolean(isPoop),
            createdAt: new Date(),
        };

        const result = await db.collection("diapers").insertOne(doc);

        return res.status(201).json({
            ok: true,
            data: { _id: result.insertedId, ...doc }
        });
    } catch (err) {
        console.error("Error saving diaper change:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to save diaper change" }
        });
    }
});

// GET /api/diapers/last/:babyId
router.get("/last/:babyId", async (req, res) => {
    try {
        const { babyId } = req.params;

        if (!ObjectId.isValid(babyId)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid baby ID" }
            });
        }

        const db = req.app.locals.db;

        const lastDiaper = await db
            .collection("diapers")
            .find({ babyId: new ObjectId(babyId) })
            .sort({ changedAt: -1 })
            .limit(1)
            .toArray();

        if (lastDiaper.length === 0) {
            return res.json({ ok: true, data: null });
        }

        return res.json({ ok: true, data: lastDiaper[0] });
    } catch (err) {
        console.error("Error fetching last diaper change:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to fetch last diaper change" }
        });
    }
});

// GET /api/diapers/:babyId - Get all diaper changes for a baby
router.get("/:babyId", async (req, res) => {
    try {
        const { babyId } = req.params;

        if (!ObjectId.isValid(babyId)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid baby ID" }
            });
        }

        const db = req.app.locals.db;

        const diapers = await db
            .collection("diapers")
            .find({ babyId: new ObjectId(babyId) })
            .sort({ changedAt: -1 })
            .toArray();

        return res.json({
            ok: true,
            data: diapers,
            count: diapers.length
        });
    } catch (err) {
        console.error("Error fetching diaper changes:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to fetch diaper changes" }
        });
    }
});

// GET /api/diapers/stats/:babyId - Get diaper statistics
router.get("/stats/:babyId", async (req, res) => {
    try {
        const { babyId } = req.params;
        const days = parseInt(req.query.days || "7");

        if (!ObjectId.isValid(babyId)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid baby ID" }
            });
        }

        const db = req.app.locals.db;

        // Calculate start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const diapers = await db
            .collection("diapers")
            .find({
                babyId: new ObjectId(babyId),
                changedAt: { $gte: startDate }
            })
            .toArray();

        const stats = {
            total: diapers.length,
            poopCount: diapers.filter(d => d.isPoop).length,
            peeCount: diapers.filter(d => !d.isPoop).length,
            averagePerDay: (diapers.length / days).toFixed(1),
            periodDays: days,
        };

        return res.json({ ok: true, data: stats });
    } catch (err) {
        console.error("Error fetching diaper stats:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to fetch diaper statistics" }
        });
    }
});

// DELETE /api/diapers/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid diaper change ID" }
            });
        }

        const db = req.app.locals.db;
        await db.collection("diapers").deleteOne({ _id: new ObjectId(id) });

        return res.json({ ok: true });
    } catch (err) {
        console.error("Error deleting diaper change:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to delete diaper change" }
        });
    }
});

module.exports = router;