import express from 'express';
import cors from 'cors';
import db from './configs/database.js';
import indexRoutes from './api/routes/index.js';
import errorHandler from './api/middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: false }));

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(indexRoutes);

app.use(errorHandler);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    app.listen(process.env.PORT || 8080);
    console.log('DB connected');
});