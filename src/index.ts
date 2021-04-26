/* eslint-disable no-unused-expressions */
// const express = require( "express" );
import express from 'express'
import path from "path";
import dotenv from "dotenv";
const bodyParser = require('body-parser');
import { Newsletter } from "./Services/Newsletter";

var routes = require('./routes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Express to use EJS
app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );

//  Connect routes to application
app.use('/', routes);

// Intialize environment variables
if (process.env.NODE_ENV !== 'production') {
  // require('dotenv').config();
  dotenv.config();
}

/**
 * Get port from environment and store in Express.
 */

new Newsletter().initializeTimer();

const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Hosting on ${port}`));
