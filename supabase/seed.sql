-- MindCanvas Seed Data
-- Demo user: harshit@mindcanvas.dev / password: demo123456

-- Insert demo user (password hash for 'demo123456' using bcrypt)
INSERT INTO profiles (id, email, password_hash, full_name, display_name, timezone, country, profession, job_title, organization, onboarding_completed)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'harshit@mindcanvas.dev',
    '$2b$12$LJ3b5Kx5Qj5Z5Z5Z5Z5Z5OYz1Yf5KxJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
    'Harshit Sharma',
    'Harshit',
    'Asia/Kolkata',
    'India',
    'Software Engineer',
    'Full Stack Developer',
    'MindCanvas',
    TRUE
);

INSERT INTO user_preferences (user_id, currency, theme, goals, interests, skills)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'INR',
    'dark',
    '{"career": "Build production-quality AI products", "learning": "Master system design and AI/ML", "fitness": "Exercise 4x per week", "financial": "Save 30% of income", "personal": "Read 2 books per month"}',
    ARRAY['AI', 'System Design', 'Open Source', 'Philosophy', 'Fitness'],
    ARRAY['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker']
);

-- Tags
INSERT INTO tags (id, user_id, name, color) VALUES
('10000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'productivity', '#22c55e'),
('10000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ai', '#8b5cf6'),
('10000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'learning', '#3b82f6'),
('10000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'personal', '#f59e0b'),
('10000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'health', '#ef4444'),
('10000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'finance', '#10b981');

-- Journal Entries (last 7 days)
INSERT INTO journal_entries (id, user_id, title, content, mood, energy_level, entry_date, word_count) VALUES
('20000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Building MindCanvas', 'Today I started building MindCanvas. The architecture is coming together nicely. Spent 4 hours on database design and API structure. Feeling really excited about this project. Had coffee with Rahul and discussed the AI integration strategy. Spent ₹350 on lunch. Meditated for 15 minutes in the morning.',
 'productive', 8, CURRENT_DATE, 52),
('20000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Deep Work Session', 'Incredible focus today. Completed the FastAPI backend structure and wrote 15 unit tests. Learning about async patterns in Python. Exercised for 40 minutes — ran 5km. Need to review the calendar integration approach tomorrow.',
 'focused', 9, CURRENT_DATE - INTERVAL '1 day', 38),
('20000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Reflection Day', 'Took it slower today. Read about system design patterns for 2 hours. The concept of event sourcing is fascinating. Had a long call with family. Spent ₹1200 on groceries. Feeling grateful for the progress this week.',
 'calm', 6, CURRENT_DATE - INTERVAL '2 days', 40),
('20000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AI Research Day', 'Explored RAG pipelines and vector databases. pgvector seems sufficient for MVP. Wrote a proof of concept for semantic search over journal entries. Meditated 20 minutes. Gym session — chest and triceps.',
 'curious', 7, CURRENT_DATE - INTERVAL '3 days', 35),
('20000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Weekend Planning', 'Planned the next sprint for MindCanvas. Need to focus on the frontend design system. Sketched some UI concepts. Went for a walk in the evening. Spent ₹600 on dinner with friends.',
 'creative', 7, CURRENT_DATE - INTERVAL '4 days', 32),
('20000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Learning TypeScript Patterns', 'Studied advanced TypeScript patterns — discriminated unions, template literal types. Applied them to the MindCanvas type system. 3 hour study session. Quick 20 min yoga.',
 'focused', 8, CURRENT_DATE - INTERVAL '5 days', 28);

-- Projects
INSERT INTO projects (id, user_id, name, description, goal, status, priority, progress, start_date, target_date, color) VALUES
('30000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'MindCanvas', 'Personal Life OS — journal, tasks, finance, learning, wellness, calendar, and AI', 'Launch MVP by end of month', 'active', 'high', 35, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '30 days', '#6366f1'),
('30000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AI Research Blog', 'Write technical blog posts about AI/ML concepts', 'Publish 4 articles this quarter', 'active', 'medium', 20, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', '#f59e0b'),
('30000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Fitness Journey', 'Structured workout and wellness tracking', 'Run a half marathon', 'active', 'medium', 45, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '120 days', '#22c55e');

-- Tasks
INSERT INTO tasks (id, user_id, project_id, title, description, due_date, priority, status) VALUES
('40000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001',
 'Implement Canvas Journal editor', 'Rich text editor with image upload and mood selector', CURRENT_DATE + INTERVAL '2 days', 'high', 'in_progress'),
('40000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001',
 'Build dashboard command center', 'Aggregated stats, greeting, daily motivation', CURRENT_DATE + INTERVAL '3 days', 'high', 'todo'),
('40000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001',
 'Google Calendar OAuth integration', NULL, CURRENT_DATE + INTERVAL '7 days', 'medium', 'todo'),
('40000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,
 'Call parents this weekend', NULL, CURRENT_DATE + INTERVAL '2 days', 'medium', 'todo'),
('40000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,
 'Buy running shoes', 'Need new pair for half marathon training', CURRENT_DATE + INTERVAL '5 days', 'low', 'todo'),
('40000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001',
 'Set up CI/CD pipeline', NULL, CURRENT_DATE + INTERVAL '10 days', 'medium', 'todo'),
('40000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000002',
 'Write article on RAG patterns', NULL, CURRENT_DATE + INTERVAL '7 days', 'medium', 'in_progress'),
('40000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,
 'Weekly grocery shopping', NULL, CURRENT_DATE + INTERVAL '1 day', 'low', 'completed');

-- Ideas
INSERT INTO ideas (id, user_id, title, description, status, priority) VALUES
('50000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AI-powered habit tracker', 'Use LLM to analyze journal entries and suggest habit improvements', 'exploring', 'high'),
('50000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Voice-first journal input', 'Allow users to speak their journal entries and transcribe with Whisper', 'captured', 'medium'),
('50000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Weekly reflection email digest', 'Auto-generated weekly summary sent via email with key metrics', 'captured', 'low'),
('50000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Open source a component library', 'Extract MindCanvas design system as a standalone package', 'planned', 'medium');

-- Financial Transactions (last 7 days)
INSERT INTO financial_transactions (user_id, amount, type, category, description, payment_method, transaction_date) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 350.00, 'expense', 'food', 'Lunch with Rahul', 'UPI', CURRENT_DATE),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1200.00, 'expense', 'shopping', 'Groceries', 'UPI', CURRENT_DATE - INTERVAL '2 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 600.00, 'expense', 'food', 'Dinner with friends', 'Cash', CURRENT_DATE - INTERVAL '4 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 199.00, 'expense', 'subscriptions', 'Spotify Premium', 'Card', CURRENT_DATE - INTERVAL '5 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2500.00, 'expense', 'education', 'Online course — System Design', 'Card', CURRENT_DATE - INTERVAL '6 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 75000.00, 'income', 'salary', 'Monthly salary', 'Bank Transfer', CURRENT_DATE - INTERVAL '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 450.00, 'expense', 'food', 'Coffee and snacks', 'UPI', CURRENT_DATE - INTERVAL '1 day');

-- Learning Items
INSERT INTO learning_items (id, user_id, title, category, progress, status, resource_url) VALUES
('60000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'System Design Masterclass', 'System Design', 30, 'in_progress', 'https://example.com/course'),
('60000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Advanced Python Async', 'Python', 60, 'in_progress', NULL),
('60000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAG & Vector Databases', 'AI', 40, 'in_progress', NULL),
('60000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Advanced TypeScript', 'TypeScript', 80, 'in_progress', NULL);

-- Learning Sessions (last 7 days)
INSERT INTO learning_sessions (user_id, learning_item_id, topic, duration_minutes, session_date) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 'Load Balancers & CDNs', 90, CURRENT_DATE),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000003', 'pgvector & Semantic Search', 120, CURRENT_DATE - INTERVAL '1 day'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000004', 'Discriminated Unions', 60, CURRENT_DATE - INTERVAL '2 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000002', 'AsyncIO internals', 45, CURRENT_DATE - INTERVAL '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 'Database Sharding', 75, CURRENT_DATE - INTERVAL '4 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000003', 'RAG Pipeline Architecture', 90, CURRENT_DATE - INTERVAL '5 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000004', 'Template Literal Types', 40, CURRENT_DATE - INTERVAL '6 days');

-- Wellness Activities (last 7 days)
INSERT INTO wellness_activities (user_id, type, activity_name, duration_minutes, intensity, activity_date) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meditation', 'Morning Mindfulness', 15, 'low', CURRENT_DATE),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'exercise', 'Running', 40, 'high', CURRENT_DATE - INTERVAL '1 day'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meditation', 'Breathing Exercise', 20, 'low', CURRENT_DATE - INTERVAL '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'exercise', 'Chest & Triceps', 45, 'high', CURRENT_DATE - INTERVAL '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'yoga', 'Morning Yoga', 20, 'medium', CURRENT_DATE - INTERVAL '5 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'exercise', 'Evening Walk', 30, 'low', CURRENT_DATE - INTERVAL '6 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meditation', 'Guided Meditation', 10, 'low', CURRENT_DATE - INTERVAL '6 days');

-- Personal Events
INSERT INTO personal_events (user_id, title, person_name, relationship, event_date, reminder_days_before) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mom''s Birthday', 'Mom', 'Mother', '2026-11-15', 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rahul''s Birthday', 'Rahul', 'Friend', '2026-09-22', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Anniversary', NULL, 'Personal', '2026-12-01', 7);
