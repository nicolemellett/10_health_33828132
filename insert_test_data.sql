USE health;

-- Insert marker user 'gold' with password 'smiths' (or 'smiths123ABC$')
INSERT INTO users (username, password) VALUES
('gold', 'smiths')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Example user and workouts
INSERT INTO users (username, password) VALUES
('alice', 'Aa1234!@'),
('bob', 'Bb1234!@')
ON DUPLICATE KEY UPDATE password = VALUES(password);

INSERT INTO workouts (user_id, title, date, duration_minutes, calories_burned, notes)
SELECT u.id, 'Morning run', '2025-10-01', 30, 300, 'Felt good' FROM users u WHERE u.username = 'alice'
UNION ALL
SELECT u.id, 'Lunchtime swim', '2025-11-02', 45, 400, 'Pool session' FROM users u WHERE u.username = 'bob';