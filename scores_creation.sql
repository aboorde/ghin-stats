-- Create the main scores table (only non-null fields based on your data)
CREATE TABLE scores (
    id BIGINT PRIMARY KEY,
    order_number INTEGER,
    score_day_order INTEGER,
    gender VARCHAR(1),
    status VARCHAR(20),
    is_manual BOOLEAN,
    number_of_holes INTEGER,
    number_of_played_holes INTEGER,
    golfer_id BIGINT,
    facility_name VARCHAR(255),
    adjusted_gross_score INTEGER,
    posted_on_home_course BOOLEAN,
    played_at DATE,
    course_id VARCHAR(50),
    course_name VARCHAR(255),
    tee_name VARCHAR(100),
    tee_set_id VARCHAR(50),
    tee_set_side VARCHAR(10),
    differential DECIMAL(4,1),
    unadjusted_differential DECIMAL(4,1),
    score_type VARCHAR(5),
    course_rating DECIMAL(4,1),
    slope_rating INTEGER,
    score_type_display_full VARCHAR(10),
    score_type_display_short VARCHAR(5),
    edited BOOLEAN,
    posted_at TIMESTAMPTZ,
    used BOOLEAN,
    revision BOOLEAN,
    pcc DECIMAL(3,1),
    exceptional BOOLEAN,
    is_recent BOOLEAN,
    net_score_differential DECIMAL(4,1),
    course_display_value VARCHAR(255),
    ghin_course_name_display VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hole details table (only non-null fields)
CREATE TABLE hole_details (
    id BIGINT PRIMARY KEY,
    score_id BIGINT REFERENCES scores(id) ON DELETE CASCADE,
    adjusted_gross_score INTEGER,
    raw_score INTEGER,
    hole_number INTEGER,
    par INTEGER,
    stroke_allocation INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create adjustments table
CREATE TABLE adjustments (
    id SERIAL PRIMARY KEY,
    score_id BIGINT REFERENCES scores(id) ON DELETE CASCADE,
    type VARCHAR(50),
    value DECIMAL(4,1),
    display VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create statistics table (only non-null fields from your data)
CREATE TABLE statistics (
    id SERIAL PRIMARY KEY,
    score_id BIGINT REFERENCES scores(id) ON DELETE CASCADE,
    up_and_downs_total INTEGER,
    par3s_average DECIMAL(4,1),
    par4s_average DECIMAL(4,1),
    par5s_average DECIMAL(4,1),
    pars_percent DECIMAL(5,3),
    birdies_or_better_percent DECIMAL(5,3),
    bogeys_percent DECIMAL(5,3),
    double_bogeys_percent DECIMAL(5,3),
    triple_bogeys_or_worse_percent DECIMAL(5,3),
    fairway_hits_percent DECIMAL(5,3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_scores_golfer_id ON scores(golfer_id);
CREATE INDEX idx_scores_played_at ON scores(played_at);
CREATE INDEX idx_scores_course_id ON scores(course_id);
CREATE INDEX idx_hole_details_score_id ON hole_details(score_id);
CREATE INDEX idx_hole_details_hole_number ON hole_details(hole_number);