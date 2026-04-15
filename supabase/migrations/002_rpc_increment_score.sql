CREATE OR REPLACE FUNCTION increment_score(p_player_id UUID, p_points INTEGER)
RETURNS void AS $$
BEGIN
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be positive';
  END IF;

  UPDATE players
  SET score = score + p_points
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION increment_score(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_score(UUID, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION transfer_host(p_room_id VARCHAR(6), p_new_host_id UUID)
RETURNS void AS $$
DECLARE
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM players
    WHERE room_id = p_room_id
      AND id = caller_id
  ) THEN
    RAISE EXCEPTION 'Caller is not a room member';
  END IF;

  UPDATE rooms
  SET host_id = p_new_host_id
  WHERE id = p_room_id;

  UPDATE players
  SET is_host = (id = p_new_host_id)
  WHERE room_id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION transfer_host(VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION transfer_host(VARCHAR, UUID) TO authenticated;
