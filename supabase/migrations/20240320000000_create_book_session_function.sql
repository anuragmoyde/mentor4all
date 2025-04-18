-- Create a function to handle session booking atomically
CREATE OR REPLACE FUNCTION book_session(
  p_mentor_id UUID,
  p_mentee_id UUID,
  p_date_time TIMESTAMP WITH TIME ZONE,
  p_duration INTEGER,
  p_price DECIMAL,
  p_title TEXT,
  p_description TEXT,
  p_availability_id UUID
) RETURNS sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session sessions;
  v_slot mentor_availability;
BEGIN
  -- Start a transaction
  BEGIN
    -- Check if the slot is still available and lock it
    SELECT * INTO v_slot
    FROM mentor_availability
    WHERE id = p_availability_id
    AND is_booked = false
    FOR UPDATE;

    -- If no slot found or already booked, raise an exception
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Time slot is no longer available';
    END IF;

    -- Mark the slot as booked
    UPDATE mentor_availability
    SET is_booked = true
    WHERE id = p_availability_id;

    -- Create the session
    INSERT INTO sessions (
      mentor_id,
      mentee_id,
      date_time,
      duration,
      price,
      title,
      description,
      status,
      payment_status
    ) VALUES (
      p_mentor_id,
      p_mentee_id,
      p_date_time,
      p_duration,
      p_price,
      p_title,
      p_description,
      'scheduled',
      'pending'
    )
    RETURNING * INTO v_session;

    -- Return the created session
    RETURN v_session;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback the transaction on any error
      RAISE;
  END;
END;
$$; 