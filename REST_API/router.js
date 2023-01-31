//Separate server deployment of server from handling of routes
//Contains modular Router

const express = require('express');
const variant_router = express.Router(); //Create router
module.exports = variant_router; //Export router

//Import sqlite3
const sqlite3 = require('sqlite3').verbose();
//Open conection with the router to interact with the database
const db = new sqlite3.Database("../Database/variants_database.sqlite")

//Import r-script package
const rscript = require('r-script-with-bug-fixes');


variant_router.use(function (req, res, next) { //Middleware with no specific route. TRiggered every time a request is recieved
    console.log('Received request'); //Logs all recieved requests (router specific processing or logging before request is handed over)
    next(); //Request handed over to the actual route handler
});


//List the genomes loaded in the dataset
variant_router.get('/genomes', function (req, res) {
    const query = 'SELECT genome_name AS Genome FROM genomes;';
    db.all(query, [], function (err, rows) {
        if (err) {
            throw err;
        }
        res.json(rows); //Results sent as JSON objects
    });
});

//List the number of variants (SNPs, InDels, or both) contained in each genome, grouped by chromosome
//The type of variant (SNP, InDel) is an optional parameter, as well as their subtype (Insertion, Deletion for InDel)
variant_router.get('/variants/number/:type?/:subtype?', function (req, res) {
    var parameters;
    //If no type of variant precised
    if (req.params.type) {
        if (req.params.subtype) {
            query = 'SELECT genome_id, chromosome, COUNT(variants.variant_id) AS variant ' +
                'FROM variants ' +
                'JOIN variants_observed ON variants.variant_id = variants_observed.variant_id ' +
                'WHERE variants.var_type = ? AND variants.var_subtype = ?' +
                'GROUP BY variants_observed.genome_id, variants.chromosome;';
            //Query parameters taking place of placeholdes in SQL query string
            parameters = [
                req.params.type,
                req.params.subtype
            ];
        }
        else {
            query = 'SELECT genome_id, chromosome, COUNT(variants.variant_id) AS variant ' +
                'FROM variants ' +
                'JOIN variants_observed ON variants.variant_id = variants_observed.variant_id ' +
                'WHERE variants.var_type = ? ' +
                'GROUP BY variants_observed.genome_id, variants.chromosome;';
            //Query parameters taking place of placeholdes in SQL query string
            parameters = [
                req.params.type
            ];
        }
    }
    else {
        query = 'SELECT genome_id, chromosome, COUNT(variants.variant_id) AS variant ' +
            'FROM variants ' +
            'JOIN variants_observed ON variants.variant_id = variants_observed.variant_id ' +
            'GROUP BY variants_observed.genome_id, variants.chromosome;';
        //Query parameters taking place of placeholdes in SQL query string
        parameters = [];
    }
    console.log(parameters);
    db.all(query, parameters, function (err, rows) {
        if (err) {
            throw err;
        }
        res.json(rows); //Results sent as JSON objects
    });
});


//Return a list of variants located in a specific region of a specific chromosome in a specific dataset
variant_router.get('/variants/region/:genome/:chromosome/:startPosition/:endPosition/:type?/:subtype?', function (req, res) {
    var parameters;
    var startQuery = 'SELECT chromosome AS chromosome, position AS position, (variants.position + LENGTH(variants.alteration)) AS end, reference AS ref, alteration AS alt, ' +
        'genomes.genome_id AS genome, ' +
        'variants_observed.quality AS qual, variants_observed.filter AS filter, ' +
        'infos.extra_info AS info, infos.info_format, infos.info_values ' +
        'FROM variants JOIN variants_observed ON variants.variant_id = variants_observed.variant_id ' +
        'JOIN genomes ON variants_observed.genome_id = genomes.genome_id ' +
        'JOIN infos ON variants_observed.info_id = infos.info_id ' +
        'WHERE genomes.genome_id = ? AND chromosome = ? ' +
        'AND variants.position >= ? AND variants.position <= ? AND (variants.position + LENGTH(variants.alteration)) <= ? '

    //If no type of variant precised
    if (req.params.type) {
        if (req.params.subtype) {
            query = startQuery +
                'AND variants.var_type = ? AND variants.var_subtype = ? ' +
                'ORDER BY variants.chromosome;';
            //Query parameters taking place of placeholdes in SQL query string
            parameters = [
                req.params.genome,
                req.params.chromosome,
                req.params.startPosition,
                req.params.endPosition,
                req.params.endPosition,
                req.params.type,
                req.params.subtype
            ];
        }
        else {
            query = startQuery +
                'AND variants.var_type = ?' +
                'ORDER BY variants.chromosome;';
            //Query parameters taking place of placeholdes in SQL query string
            parameters = [
                req.params.genome,
                req.params.chromosome,
                req.params.startPosition,
                req.params.endPosition,
                req.params.endPosition,
                req.params.type
            ];
        }
    }
    else {
        query = startQuery +
            'ORDER BY variants.chromosome;';
        //Query parameters taking place of placeholdes in SQL query string
        parameters = [
            req.params.genome,
            req.params.chromosome,
            req.params.startPosition,
            req.params.endPosition,
            req.params.endPosition
        ];
    }
    console.log(parameters);
    db.all(query, parameters, function (err, rows) {
        if (err) {
            throw err;
        }
        res.json(rows); //Results sent as JSON objects
    });
});

//Using an R script, report and plot the variants (SNPNs, InDels or both) density for a specific window size
//accross a specific chromosome and for a specific genome
variant_router.get('/variants/density/:genome/:chromosome/:windowSize/:type?/:subtype?', function (req, res) {
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
            var varDensity = variantDensity(Number(rows[0].maxPos), parameters, Number(req.params.windowSize));
            //Save result in a json and display
            res.json(varDensity);
        });
    }
});

function variantDensity(maxPosition, parameters, windowSize) {
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

        promise = Promise.all([calculateDensity(maxPosition, parameters, startPosition, endPosition)]).then(function(density){
                    console.log("promise: " + density);
                    variantDensity.push(density);
                }); //Get value of promise function (async)

        startPosition += windowSize;
        endPosition += windowSize;
    }

    console.log("var density final: " + variantDensity);
    //Return array of variant density
    return(variantDensity);
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
    for (j = 0; j < parameters.length; j++){
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
    return(variantDensity.density);
}   


//Callback used in sqlite3.Database.all is async: the code is executed without any waiting.
//Variable cannot be assigned into the callback function of all without waiting.
//Creation of asyncheonous function to get result from database.
async function getCounts(db, query, newParam){
    return new Promise(function(resolve, reject){
        db.get(query, newParam, function(err, row){
            if (err) reject(err);
            resolve(row);
        });
    });
}