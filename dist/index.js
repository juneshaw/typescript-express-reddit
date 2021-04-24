"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const bodyParser = require('body-parser');
var routes = require('./routes/index');
const app = express_1.default();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use('/', routes);
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Hosting on ${port}`));
