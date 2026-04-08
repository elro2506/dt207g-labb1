/**
 * Laboration 1: Express
 */
"use strict";

console.log("JS funkar!");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgresql://cvuser:pvIAoDGNvKvTgcyjpc4TYGaQh1KoTTuF@dpg-d79ms6ea2pns73e7bkog-a.oregon-postgres.render.com/cv_iswp",
    ssl: {
        rejectUnauthorized: false
    }
})



pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.log("DB error", err);
    } else {
        console.log("DB funkar");
    }
});


app.set("view engine", "ejs");
app.use(express.static("public"));          //Statiska filer i katalogen Public
app.use(bodyParser.urlencoded({ extended: true }));


//Radera
app.get("/courses/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
    res.redirect("/courses");
  }    catch (err) {
    console.error(err);
  }
});


//Route
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/courses/add", (req, res) => {
    res.render("addcourse", {
        errors: [],
        courseCode: "",
        courseName: "",
        syllabus: "",
        progression: ""
    });
});

app.get("/courses", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM courses");
        res.render("courses", {
            courses: result.rows
        });
    } catch (err) {
        console.error(err);
    }
});

app.post("/courses/add", async (req, res) => {
    const { coursecode, coursename, syllabus, progression } = req.body;

    let errors = [];

    //Validera input
    if (!coursecode) errors.push("Ange en kurskod");
    if (!coursename) errors.push("Ange ett kursnamn");
    if (!syllabus) errors.push("Ange en kursplan");
    if (!progression) errors.push("Ange en progression");

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
        await pool.query(`INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES($1, $2, $3, $4)`,
            [coursecode, coursename, syllabus, progression]
        );

        res.redirect("/courses");
    } catch (err) {
        console.error(err);

    }
});

app.get("/about", (req, res) => {
    res.render("about");
});



//Starta
app.listen(port, () => {
    console.log("Server started on port: " + port);
});





