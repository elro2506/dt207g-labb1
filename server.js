/**
 * Laboration 1: Express
 */
"use strict";

console.log("JS funkar!");
const mysql = require("mysql");

//Anslutningsinställningar
const connection = mysql.createConnection({
    host: "localhost",
    user: "mysqltest1",
    password: "password",
    database: "mysqltest1"
});

connection.connect((err) => {
    if (err) {
        console.error("Connection failed " + err);
        return;
    }

    console.log("Connected to SQL.");
});

//SQL-frågor


const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));          //Statiska filer i katalogen Public
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/courses", (req, res) => {
    const sql = "SELECT * FROM courses";
    connection.query(sql, (err, results) => {
        if (err) throw err;
        res.render("courses", {
            courses: results
        });
    });
});

    app.post("/courses/add", (req, res) => {
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

        const sql = `INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES(?, ?, ?, ?)`;

        connection.query(
            sql,
            [coursecode, coursename, syllabus, progression],
            (err) => {
                if (err) throw err;

                res.redirect("/courses");
            }
        );
    });


    app.get("/about", (req, res) => {
        res.render("about");
    });

    //Starta
    app.listen(port, () => {
        console.log("Server started on port: " + port);
    });

