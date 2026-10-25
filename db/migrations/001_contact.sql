CREATE SCHEMA IF NOT EXISTS contact_private;
REVOKE ALL ON SCHEMA contact_private FROM PUBLIC;

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  interest text NOT NULL CHECK (interest IN ('Academy', 'Sponsoring', 'Marketplace', 'Partnership')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_submissions_created_at ON public.contact_submissions (created_at);
REVOKE ALL ON public.contact_submissions FROM PUBLIC;

CREATE TABLE contact_private.rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL,
  reset_at timestamptz NOT NULL
);
REVOKE ALL ON contact_private.rate_limits FROM PUBLIC;

CREATE FUNCTION contact_private.consume_limit(p_key text, p_limit integer, p_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE attempts_now integer;
BEGIN
  IF char_length(p_key) > 80 OR p_limit NOT BETWEEN 1 AND 1000 OR p_seconds NOT BETWEEN 1 AND 3600 THEN
    RAISE EXCEPTION 'Invalid limit configuration';
  END IF;
  INSERT INTO contact_private.rate_limits AS current (key, attempts, reset_at)
  VALUES (p_key, 1, statement_timestamp() + make_interval(secs => p_seconds))
  ON CONFLICT (key) DO UPDATE SET
    attempts = CASE WHEN current.reset_at <= statement_timestamp() THEN 1 ELSE least(current.attempts + 1, p_limit + 1) END,
    reset_at = CASE WHEN current.reset_at <= statement_timestamp() THEN statement_timestamp() + make_interval(secs => p_seconds) ELSE current.reset_at END
  RETURNING attempts INTO attempts_now;
  RETURN attempts_now <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION contact_private.consume_limit(text, integer, integer) FROM PUBLIC;

GRANT USAGE ON SCHEMA public, contact_private TO kalvia_app;
GRANT INSERT (name, email, interest, message) ON public.contact_submissions TO kalvia_app;
GRANT EXECUTE ON FUNCTION contact_private.consume_limit(text, integer, integer) TO kalvia_app;
GRANT USAGE ON SCHEMA public TO kalvia_reader;
GRANT SELECT ON public.contact_submissions TO kalvia_reader;
GRANT USAGE ON SCHEMA public, contact_private TO kalvia_maintenance;
GRANT SELECT (created_at), DELETE ON public.contact_submissions TO kalvia_maintenance;
GRANT SELECT (reset_at), DELETE ON contact_private.rate_limits TO kalvia_maintenance;
