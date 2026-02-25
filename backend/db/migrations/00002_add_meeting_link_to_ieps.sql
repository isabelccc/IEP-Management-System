-- Add optional meeting link (e.g. Zoom URL) to IEPs
ALTER TABLE ieps ADD COLUMN IF NOT EXISTS meeting_link TEXT;
COMMENT ON COLUMN ieps.meeting_link IS 'Optional URL for the IEP meeting (e.g. Zoom, Meet).';
