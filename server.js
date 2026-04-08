/**
 * Laboration 1: Express
 */
"use strict";

//Testar så att servern startar
console.log("JS funkar!");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
//Renders port som jag konfiguerat, annars localhost: 3000
const port = process.env.PORT || 3000;
//Importerar postgresql
const { Pool } = require("pg");
//Skapar en anslutning till databasen
const pool = new Pool({
    //DATABASE_URL är det jag döpt det till i Render
    connectionString: process.env.DATABASE_URL,
    //SSL för anslutning till databasen
    ssl: {
        rejectUnauthorized: false
    }
});


//Kollar så att databasen funkar
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.log("Databas-error", err);
    } else {
        console.log("Databasen funkar");
    }
});

//Sätter EJS som view engine
app.set("view engine", "ejs");

app.use(express.static("public"));          //Statiska filer i katalogen Public
//Gör så att vi kan läsa data från formulär
app.use(bodyParser.urlencoded({ extended: true }));


//Radera kurs
app.get("/courses/delete/:id", async (req, res) => {
    try {
        //Tar bort kurs baserat på id
        await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
        //Man hamnar på kurssidan igen
        res.redirect("/courses");
    } catch (err) {
        console.error(err);
    }
});


//Route
//Startsidan
app.get("/", (req, res) => {
    res.render("index");
});

//Sidan för att lägga till kurser
app.get("/courses/add", (req, res) => {
    res.render("addcourse", {
        errors: [],
        courseCode: "",
        courseName: "",
        syllabus: "",
        progression: ""
    });
});

//Visar alla kurser
app.get("/courses", async (req, res) => {
    try {
        //Hämtar kurser från databasen
        const result = await pool.query("SELECT * FROM courses");
        //Skickar dem till EJS-vyn
        res.render("courses", {
            courses: result.rows
        });
    } catch (err) {
        console.error(err);
    }
});

//Lägger till kurs
app.post("/courses/add", async (req, res) => {
    const { coursecode, coursename, syllabus, progression } = req.body;

    let errors = [];

    //Validera input
    if (!coursecode) errors.push("Ange en kurskod");
    if (!coursename) errors.push("Ange ett kursnamn");
    if (!syllabus) errors.push("Ange en kursplan");
    if (!progression) errors.push("Ange en progression");

    //Felmeddelande vid fel
    if (errors.length > 0) {
        return res.render("addcourse", {
            errors,
            courseCode: coursecode,
            courseName: coursename,
            syllabus,
            progression

        });
    }

    try {
        //Lägger till ny kurs i databasen
        await pool.query(`INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES($1, $2, $3, $4)`,
            [coursecode, coursename, syllabus, progression]
        );
        //Tillbaka till kurssidan
        res.redirect("/courses");
    } catch (err) {
        console.error(err);

    }
});

//Om-sidan
app.get("/about", (req, res) => {
    res.render("about");
});



//Starta servern
app.listen(port, () => {
    console.log("Server started on port: " + port);
});





