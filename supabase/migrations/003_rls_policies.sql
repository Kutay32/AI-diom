ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE idioms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rooms_select_authenticated ON rooms;
CREATE POLICY rooms_select_authenticated
ON rooms
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS rooms_insert_authenticated ON rooms;
CREATE POLICY rooms_insert_authenticated
ON rooms
FOR INSERT
TO authenticated
WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS rooms_update_host_only ON rooms;
CREATE POLICY rooms_update_host_only
ON rooms
FOR UPDATE
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS players_select_authenticated ON players;
CREATE POLICY players_select_authenticated
ON players
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS players_insert_self ON players;
CREATE POLICY players_insert_self
ON players
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Score update is intentionally blocked from direct table writes.
-- Clients must call increment_score RPC.

DROP POLICY IF EXISTS idioms_select_authenticated ON idioms;
CREATE POLICY idioms_select_authenticated
ON idioms
FOR SELECT
TO authenticated
USING (true);
