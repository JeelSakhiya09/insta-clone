import mongoose from "mongoose";

export function connectMongoDb(url) {
    return mongoose.connect(url);
}