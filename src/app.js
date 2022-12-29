import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import indexRoute from './api/routes/index.js';

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.pfnzbiy.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(indexRoute);

app.use((error, req, res, next) => {
    const { statusCode, message, data, validationErrors } = error;
    res.status(statusCode || 500).json({ message, data, validationErrors });
});

mongoose
    .connect(
        MONGODB_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(result => {
        app.listen(process.env.PORT || 8080);
        console.log('connected');
    })
    .catch(err => {
        console.log(err);
    });