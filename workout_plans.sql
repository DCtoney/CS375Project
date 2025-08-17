-- workout_plans.sql
-- Run this file if you want to add workout plan saving functionality
-- This is optional and can be added later

\c workouttracker

-- Table for saving user workout plans
CREATE TABLE workout_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_data JSONB NOT NULL, -- Store the entire workout plan as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample workout plans for testing
INSERT INTO workout_plans (plan_name, plan_data) VALUES 
(
    'Beginner Push Pull Legs',
    '{
        "push": [
            {"name": "Push-ups", "type": "strength", "muscle": "chest", "equipment": "body_only", "difficulty": "beginner"},
            {"name": "Overhead Press", "type": "strength", "muscle": "shoulders", "equipment": "barbell", "difficulty": "intermediate"}
        ],
        "pull": [
            {"name": "Pull-ups", "type": "strength", "muscle": "lats", "equipment": "other", "difficulty": "intermediate"},
            {"name": "Bent Over Row", "type": "strength", "muscle": "middle_back", "equipment": "barbell", "difficulty": "intermediate"}
        ],
        "legs": [
            {"name": "Squats", "type": "strength", "muscle": "quadriceps", "equipment": "barbell", "difficulty": "intermediate"},
            {"name": "Romanian Deadlift", "type": "strength", "muscle": "hamstrings", "equipment": "barbell", "difficulty": "intermediate"}
        ]
    }'
);

-- Index for faster searching by plan name
CREATE INDEX idx_workout_plans_name ON workout_plans(plan_name);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at when plan is modified
CREATE TRIGGER update_workout_plans_updated_at 
    BEFORE UPDATE ON workout_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();