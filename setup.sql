CREATE DATABASE workouttracker;
\c workouttracker
CREATE TABLE workouts (
	id SERIAL PRIMARY KEY,
	excersiseName VARCHAR(32),
	form VARCHAR(16),
	muscle VARCHAR(16),
	equipment VARCHAR(16),
	difficulty VARCHAR(16),
	videoLink VARCHAR(128),
	imageLink VARCHAR(128)
);
