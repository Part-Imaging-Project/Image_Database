CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    part_number VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE camera (
    id SERIAL PRIMARY KEY,
    device_model VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL
);

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    image_size INTEGER NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    part_id INT REFERENCES part(id) ON DELETE CASCADE,
    camera_id INT REFERENCES camera(id) ON DELETE SET NULL
);

CREATE TABLE metadata (
    id SERIAL PRIMARY KEY,
    image_id INT REFERENCES image(id) ON DELETE CASCADE,
    resolution VARCHAR(50) NOT NULL,
    capture_mode VARCHAR(50) NOT NULL,
    notes TEXT
);


select * from images;
select * from parts; 
select * from camera;
select * from metadata;