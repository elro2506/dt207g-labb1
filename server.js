/**
 * Laboration 1: Express
 */
"use strict";

//Testar att servern går igång
console.log("JavaScript funkar!");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
//Port 3000 lokalt men Render använder process.env.PORT
const port = process.env.PORT || 3000;
//Importerar PostgreSQL
const { Pool } = require("pg");

//En pool för databasansltutningen
const pool = new Pool({
    //Env-variabel från Render
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
    
});


//Testar att databasen funkar
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.log("Databas-error", err);
    } else {
        console.log("Databasen funkar");
    }
});

//EJS som view enginge
app.set("view engine", "ejs");
app.use(express.static("public"));          //Statiska filer i katalogen Public
//Här läser jag in data från formuläret
app.use(bodyParser.urlencoded({ extended: true }));


//Route för att radera kurs
app.get("/courses/delete/:id", async (req, res) => {
    try {
        //Kurs tas bort baserat på id
        await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
        //Efter radering hamnar man på courses-sidan igen
        res.redirect("/courses");
    } catch (err) {
        console.error(err);
    }
});


//Routes

//Startsidan
app.get("/", (req, res) => {
    res.render("index");
});

//Sidan för att lägga till kurs
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
        const result = await pool.query("SELECT * FROM courses");

        //Skickar all data till EJS-vyn
        res.render("courses", {
            courses: result.rows
        });
    } catch (err) {
        console.error(err);
    }
});

//Lägger till kurs med post
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
        //Man skickas till courses-sidan
        res.redirect("/courses");
    } catch (err) {
        console.error(err);

    }
});

app.get("/about", (req, res) => {
    res.render("about");
});



//Starta servern
app.listen(port, () => {
    console.log("Server started on port: " + port);
});





