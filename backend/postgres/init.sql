CREATE TABLE IF NOT EXISTS userinfo (
    user_id INTEGER NOT NULL PRIMARY KEY,
    pin VARCHAR(64) NOT NULL default '0000',
    language VARCHAR(64) NOT NULL default 'KOR',
    theme VARCHAR(64) NOT NULL default 'light',
    alarm_sound BOOLEAN NOT NULL default true,
    alarm_window BOOLEAN NOT NULL default true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS systeminfo (
    system_id INTEGER NOT NULL,
    ip VARCHAR(64) NOT NULL default '127.0.0.1',
    description VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS channelinfo (
    channel_id VARCHAR(64) NOT NULL PRIMARY KEY,
    channel_name VARCHAR(256) NOT NULL,
    description VARCHAR(256) NOT NULL,
    rtsp_url VARCHAR(256),
    channel_roi VARCHAR(256),
    threshold_pixel VARCHAR(256),
    threshold_time VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS systemlog (
    idx SERIAL NOT NULL PRIMARY KEY,
    id VARCHAR(256) NOT NULL,
    time TIMESTAMP NOT NULL,
    log_level VARCHAR(64) NOT NULL,
    log_msg VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS channellog (
    idx SERIAL NOT NULL PRIMARY KEY,
    id VARCHAR(64) NOT NULL,
    time TIMESTAMP NOT NULL,
    log_level VARCHAR(64) NOT NULL,
    log_msg VARCHAR(256) NOT NULL
);