//Separate server deployment of server from handling of routes
//Contains modular Router

const express = require('express');

//Import sqlite3
const sqlite3 = require('sqlite3').verbose();
//Open conection with the router to interact with the database
const db = new sqlite3.Database("../Database/variants_database.sqlite")

const microbe_router = express.Router(); //Create router

//Import r-script package
const rscript = require('r-script-with-bug-fixes');
