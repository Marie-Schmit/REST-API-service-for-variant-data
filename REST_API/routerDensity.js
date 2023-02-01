//Separate server deployment of server from handling of routes
//Contains modular Router

const express = require('express');
const density_router = express.Router(); //Create router
module.exports = density_router; //Export router

//Import sqlite3
const sqlite3 = require('sqlite3').verbose();
//Open conection with the router to interact with the database
const db = new sqlite3.Database("../Database/variants_database.sqlite")

//Import r-script package
const rscript = require('r-script-with-bug-fixes');
const { result } = require('underscore');


//Using an R script, report and plot the variants (SNPNs, InDels or both) density for a specific window size
//accross a specific chromosome and for a specific genome
density_router.get('/density/:genome/:chromosome/:windowSize/:type?/:subtype?', function (req, res) {
    if (req.params.windowSize == 0) {
        res.send("Window size is null. Please select a new window size.");
    }
    else {
        var maxWindows;
        //Select the maximal position of a variant for the specified genome and chromosome
        var startQuery = 'SELECT MAX(variants.position) AS maxPos FROM variants ' +
            'JOIN variants_observed ON variants_observed.variant_id = variants.variant_id ' +
            'JOIN genomes ON variants_observed.genome_id = genomes.genome_id ' +
            'AND genomes.genome_id = ? AND variants.chromosome = ?';

        if (req.params.type) {
            if (req.params.subtype) {
                query = startQuery +
                    ' AND variants.var_type = ? AND variants.var_subtype = ?;';
                //Query parameters taking place of placeholdes in SQL query string
                parameters = [
                    req.params.genome,
                    req.params.chromosome,
                    req.params.type,
                    req.params.subtype
                ];
            }
            else {
                query = startQuery +
                    ' AND variants.var_type = ?';
                //Query parameters taking place of placeholdes in SQL query string
                parameters = [
                    req.params.genome,
                    req.params.chromosome,
                    req.params.type
                ];
            }
        }
        else {
            query = startQuery;
            //Query parameters taking place of placeholdes in SQL query string
            parameters = [
                req.params.genome,
                req.params.chromosome
            ];
        }
        console.log(parameters);

        db.all(query, parameters, function (err, rows) {
            if (err) {
                throw err;
            }
            //Get array of variant density accross every chosen windows
            //var varDensity = variantDensity(Number(rows[0].maxPos), parameters, Number(req.params.windowSize));
            //Save result in a json and display
            Promise.all([variantDensity(Number(rows[0].maxPos), parameters, Number(req.params.windowSize))]).then(function ([varDensity]) {
                console.log("in");
                var resultDensity = jsonResult(parameters, req.params.windowSize, varDensity);
                console.log(resultDensity);
                console.log("out");
                res.json(resultDensity);
            })
        });
    }
});


async function variantDensity(maxPosition, parameters, windowSize) {
    //Store maximal number of windows
    maxWindows = Math.ceil(maxPosition / windowSize); //Results sent as JSON objects

    console.log("Win size: " + windowSize);
    console.log("Max position: " + maxPosition);
    console.log("Max window: " + maxWindows);

    var i;
    //Initialise start and end positions
    var startPosition = 0;
    var endPosition = windowSize;
    //Array containing variant density
    const variantDensity = [];
    for (i = 0; i <= maxWindows; i++) {
        console.log("\n\n Start: " + startPosition);
        console.log("End: " + endPosition);
        //For the current window, calculate value of density and add it to array
        //variantDensity.push(calculateDensity(maxPosition, parameters, startPosition, endPosition));

        promise = await (calculateDensity(maxPosition, parameters, startPosition, endPosition));
        variantDensity.push(promise);//Get value of promise function (async)

        startPosition += windowSize;
        endPosition += windowSize;
    }

    console.log("var density final: " + variantDensity);
    //Return array of variant density
    return (variantDensity);
}

async function calculateDensity(maxPosition, parameters, startPosition, endPosition) {
    const startQuery = 'SELECT COUNT(variants.variant_id) AS density FROM variants ' +
        'JOIN variants_observed ON variants_observed.variant_id = variants.variant_id ' +
        'JOIN genomes ON variants_observed.genome_id = genomes.genome_id ' +
        'WHERE genomes.genome_id = ? AND variants.chromosome = ?';

    const endQuery = ' AND variants.position > ? AND variants.position <= ?;';

    //Add start and end position of the window to parameters
    var newParam = [];
    var j;
    //Parameters need to be copied in a new instance. Otherwise, the array will be modified at each loop.
    for (j = 0; j < parameters.length; j++) {
        newParam.push(parameters[j]);
    }

    newParam.push(startPosition);
    newParam.push(endPosition);

    if (newParam.length > 4) { //Condition on type
        var query = startQuery + ' AND variants.var_type = ?' + endQuery;

        if (newParam.length > 5) //Condition on subtype{
            var query = startQuery + ' AND variants.var_type = ? AND variants.var_subtype = ?' + endQuery;
    }
    else {
        var query = startQuery + endQuery;
    }

    //Make request to database to get the number of variants for the current window.
    //Wait database query result.
    var variantDensity = await getCounts(db, query, newParam);

    console.log("density: " + variantDensity.density);
    return (variantDensity.density);
}


//Callback used in sqlite3.Database.all is async: the code is executed without any waiting.
//Variable cannot be assigned into the callback function of all without waiting.
//Creation of asyncheonous function to get result from database.
async function getCounts(db, query, newParam) {
    return new Promise(function (resolve, reject) {
        db.get(query, newParam, function (err, row) {
            if (err) reject(err);
            resolve(row);
        });
    });
}

//Function that create a json to store the array of variants located in a specific region of a specific chromosome in a specific dataset
function jsonResult(parameters, windowSize, varDensity) {
    //Json creation 
    var resultDensity = {
    };
    //Result to show is the list of variants for the given window and parameters
    //Add genome and chromosome
    resultDensity.Genome = parameters[0];
    resultDensity.Chromosome = parameters[1];

    //If they were given, specify type and subtype
    if (parameters.length > 2) {
        resultDensity.Type = parameters[2];
        if (parameters.length > 3) {
            resultDensity.Subtype = parameters[3];
        }
    }

    //Add window size
    resultDensity.WindowSize = windowSize;
    //Array containing a list of windows and their density
    resultDensity.Window = [];

    for (var i = 0; i < varDensity.length; i++) {
        //Number of window
        var windowDens = {
        };
        //Specify the window (start and end position) and it's coresponding density in an object
        windowDens.StartPosition = i * windowSize;
        windowDens.EndPosition = (1 + i) * windowSize;
        windowDens.Density = varDensity[i];

        //Save the object containing window specification in the results array
        resultDensity.Window.push(windowDens);
    }

    return resultDensity;
}