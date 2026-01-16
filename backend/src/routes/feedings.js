const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

// POST /api/feedings
router.post("/", async (req, res) => {
    try {
        const { babyId, feedStartedAt, feedDurationSec, burpDurationSec, ml } = req.body;

        if (
            !ObjectId.isValid(babyId) ||
            !feedStartedAt ||
            typeof feedDurationSec !== "number" ||
            typeof burpDurationSec !== "number" ||
            typeof ml !== "number"
        ) {
            return res.status(400).json({ ok: false, error: { message: "Invalid payload" } });
        }

        const db = req.app.locals.db;

        const doc = {
            babyId: new ObjectId(babyId),
            feedStartedAt: new Date(feedStartedAt),
            feedDurationSec,
            burpDurationSec,
            ml,
            createdAt: new Date(),
        };

        const result = await db.collection("feedings").insertOne(doc);

        return res.status(201).json({ ok: true, data: { _id: result.insertedId } });
    } catch (err) {
        return res.status(500).json({ ok: false, error: { message: "Failed to save feeding session" } });
    }
});


// GET /api/feedings/last/:babyId
router.get("/last/:babyId", async (req, res) => {
    try {
        const { babyId } = req.params;

        // Step 1: Validate the babyId is a valid MongoDB ObjectId
        if (!ObjectId.isValid(babyId)) {
            return res.status(400).json({
                ok: false,
                error: { message: "Invalid baby ID" }
            });
        }

        const db = req.app.locals.db;

        // Step 2: Find the most recent feeding for this baby
        const lastFeeding = await db
            .collection("feedings")
            .find({ babyId: new ObjectId(babyId) })  // Filter: only this baby's feedings
            .sort({ feedStartedAt: -1 })              // Sort: newest first (-1 = descending)
            .limit(1)                                  // Limit: only get 1 result
            .toArray();                                // Convert cursor to array

        // Step 3: Check if we found anything
        if (lastFeeding.length === 0) {
            // No feedings found - this is OK, baby might be new
            return res.json({ ok: true, data: null });
        }

        // Step 4: Return the first (and only) result
        return res.json({ ok: true, data: lastFeeding[0] });

    } catch (err) {
        console.error("Error fetching last feeding:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to fetch last feeding" }
        });
    }
});


// GET /api/feedings/:babyId - Get all feedings for a baby
// IMPORTANT: This route must come AFTER /last/:babyId to avoid route conflicts
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

        const feedings = await db
            .collection("feedings")
            .find({ babyId: new ObjectId(babyId) })
            .sort({ feedStartedAt: -1 })
            .toArray();

        return res.json({ ok: true, data: feedings });
    } catch (err) {
        console.error("Error fetching feedings:", err);
        return res.status(500).json({
            ok: false,
            error: { message: "Failed to fetch feedings" }
        });
    }
});


module.exports = router;