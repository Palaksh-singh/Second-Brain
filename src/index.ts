//const express = require("express");   don't use this as this doesn't include types

import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";


const app = express();
app.use(express.json());

//.d.ts file

app.post("/api/v1/signup", async (req, res) => {
    //TODO: zod validation , hash the password
    const username = req.body.username;
    const password = req.body.password;

    await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "User signed up"
    })
})

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;

    if (!req.userId) {
        res.status(401).json({
            message: "User is not authenticated"
        });
        return;
    }

    await ContentModel.create({
        link,
        type,
        userId: new mongoose.Types.ObjectId(req.userId),
        tags: []
    });

    return res.json({
        message: "Content added"
    });
})

app.get("/api/v2/content", userMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "User is not authenticated" });
        return;
    }

    const content = await ContentModel.find({
        userId: new mongoose.Types.ObjectId(userId)
    }).populate("userId", "username");

    res.json({
        content
    });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    if (!req.userId) {
        res.status(401).json({ message: "User is not authenticated" });
        return;
    }

    await ContentModel.deleteMany({
        _id: new mongoose.Types.ObjectId(contentId),
        userId: new mongoose.Types.ObjectId(req.userId)
    });

    res.json({ 
        message: "Content deleted",
    });
});

app.post("/api/v1/brain/share", (req, res) => {

})

app.get("/api/v1/brain/:shareLink", (req, res) => {

})

app.listen(3000);