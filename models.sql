

CREATE TABLE users(
  user_pid SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email VARCHAR(50) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  registration TIMESTAMP NOT NULL DEFAULT now(),
  enable BOOLEAN NOT NULL DEFAULT true,
  activationLink VARCHAR(50) NOT NULL,
  isActivated BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE tokens(
  token_pid SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  token_date TIMESTAMP NOT NULL DEFAULT now(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id)
);

CREATE TABLE notes(
  notes_pid SERIAL PRIMARY KEY,
  note_id VARCHAR(100) NOT NULL,
  note_header TEXT NOT NULL,
  note_content TEXT,
  note_date BIGINT NOT NULL,
  note_used BIGINT NOT NULL,
  note_selected BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES users(user_id)
);
