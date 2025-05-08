-- Add credits to the development user account
-- Usage: docker-compose exec db psql -U postgres -d system_design_playground -f /app/scripts/add-credits.sql

-- Get the amount from the first argument or use default of 5000
\set amount :ARGS:1
\set amount_num :amount::integer
\set default_amount 5000

-- If amount is not provided or invalid, use default
DO $$
DECLARE
  add_amount INTEGER;
BEGIN
  IF :'amount' = '' THEN
    add_amount := 5000;
  ELSE
    BEGIN
      add_amount := :'amount'::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Invalid amount provided, using default (5000)';
      add_amount := 5000;
    END;
  END IF;
  
  -- First check if user exists
  IF NOT EXISTS (SELECT 1 FROM sdp_users WHERE id = 'dev_user_123') THEN
    RAISE NOTICE 'Development user not found. Creating user...';
    INSERT INTO sdp_users (id, email, created_at, updated_at)
    VALUES ('dev_user_123', 'dev@example.com', NOW(), NOW());
    RAISE NOTICE 'Development user created.';
  END IF;
  
  -- Update or insert credits
  IF EXISTS (SELECT 1 FROM sdp_credits WHERE user_id = 'dev_user_123') THEN
    UPDATE sdp_credits 
    SET balance = balance + add_amount, 
        updated_at = NOW() 
    WHERE user_id = 'dev_user_123';
    
    RAISE NOTICE 'Updated credits. New balance: %', 
      (SELECT balance FROM sdp_credits WHERE user_id = 'dev_user_123');
  ELSE
    INSERT INTO sdp_credits (user_id, balance, updated_at) 
    VALUES ('dev_user_123', add_amount, NOW());
    
    RAISE NOTICE 'Created credits record. New balance: %', add_amount;
  END IF;
  
  -- Record the transaction
  INSERT INTO sdp_credit_transactions 
    (user_id, amount, type, description, status, created_at) 
  VALUES 
    ('dev_user_123', add_amount, 'purchase', 'Added via add-credits script', 'completed', NOW());
    
  RAISE NOTICE 'Credits added successfully!';
END $$; 