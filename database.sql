/*Databas för min webbplats*/

CREATE TABLE courses (
    id SERIAL PRIMARY KEY, /*För att postgresql använder serial i stället för auto_increment*/
    coursecode TEXT NOT NULL,
    coursename TEXT NOT NULL,
    syllabus TEXT NOT NULL,
    progression TEXT NOT NULL
)