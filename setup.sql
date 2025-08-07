CREATE DATABASE workouttracker;
\c workouttracker

-- Updated workouts table with correct spelling and proper field types
CREATE TABLE workouts (
	id SERIAL PRIMARY KEY,
	exerciseName VARCHAR(100) NOT NULL,  -- Fixed spelling and increased length
	form VARCHAR(50),  -- Type of exercise (cardio, strength, etc.)
	muscle VARCHAR(50),  -- Muscle group
	equipment VARCHAR(50),  -- Equipment needed
	difficulty VARCHAR(20),  -- Difficulty level
	videoLink VARCHAR(255),  -- Video URL (increased length for long URLs)
	imageLink VARCHAR(255),  -- Image URL (increased length for long URLs)
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- some sample data to get started
INSERT INTO workouts (exerciseName, form, muscle, equipment, difficulty, videoLink, imageLink) VALUES
('Push-ups', 'bodyweight', 'chest', 'none', 'beginner', 'https://youtube.com/watch?v=sample1', 'https://example.com/pushup.jpg'),
('Pull-ups', 'bodyweight', 'back', 'none', 'intermediate', 'https://youtube.com/watch?v=sample2', 'https://example.com/pullup.jpg'),
('Squats', 'bodyweight', 'legs', 'none', 'beginner', 'https://youtube.com/watch?v=sample3', 'https://example.com/squat.jpg'),
('Bench Press', 'strength', 'chest', 'barbell', 'intermediate', 'https://youtube.com/watch?v=sample4', 'https://example.com/bench.jpg'),
('Deadlifts', 'powerlifting', 'back', 'barbell', 'advanced', 'https://youtube.com/watch?v=sample5', 'https://example.com/deadlift.jpg');