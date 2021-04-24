/* eslint-disable no-unused-expressions */
// const express = require( "express" );
import express from 'express'
import path from "path";
import dotenv from "dotenv";
const bodyParser = require('body-parser');
// import * as routes from "./Routes";
var routes = require('./routes/index');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Express to use EJS
app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );

// Define a route handler
// routes.register( app );
app.use('/', routes);

// Intialize environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
/**
 * Get port from environment and store in Express.
 */

const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Hosting on ${port}`));
