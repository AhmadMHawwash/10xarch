-- Seed script for development database
-- This adds a default user and credits for local development

-- Insert default dev user if it doesn't exist
INSERT INTO sdp_users (id, email, created_at, updated_at)
VALUES 
    ('dev_user_123', 'dev@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert credits for the dev user
-- First check if credits record exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM sdp_credits WHERE user_id = 'dev_user_123') THEN
        -- Update existing record
        UPDATE sdp_credits 
        SET balance = balance + 10000,
            updated_at = NOW()
        WHERE user_id = 'dev_user_123';
    ELSE
        -- Insert new record
        INSERT INTO sdp_credits (user_id, balance, updated_at)
        VALUES ('dev_user_123', 10000, NOW());
    END IF;
END
$$;

-- Add a credit transaction record
INSERT INTO sdp_credit_transactions (
    user_id, 
    amount, 
    type, 
    description, 
    status, 
    created_at
)
VALUES (
    'dev_user_123', 
    10000, 
    'purchase', 
    'Initial development credits', 
    'completed', 
    NOW()
);

-- Output confirmation
SELECT 'Database seeded with dev user and credits' as result; 