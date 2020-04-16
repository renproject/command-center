// tslint:disable: no-console

import cors from "cors";
import express from "express";

import { Database } from "./loadDB";

const { version } = require("./package.json");

const PORT = process.env.PORT || 8080;

export const startServer = async (db: Database) => {
    const app = express();
    app.use(cors());

    app.get("/health", (req, res) => {
        res.json({ online: true, message: `RenVM Command Center V${version}` });
    });

    app.get("/search/:query", async (req, res) => {
        const queryRaw = req.params.query;

        if (!queryRaw) {
            throw new Error("No query.");
        }

        res.json({});
    });

    // start the Express server
    app.listen(PORT, () => {
        console.info(`Server started at http://localhost:${PORT}.`);
    });
};

