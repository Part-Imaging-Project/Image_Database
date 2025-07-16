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
    part_id INT REFERENCES parts(id) ON DELETE CASCADE,
    camera_id INT REFERENCES camera(id) ON DELETE SET NULL
);

CREATE TABLE metadata (
    id SERIAL PRIMARY KEY,
    image_id INT REFERENCES images(id) ON DELETE CASCADE,
    resolution VARCHAR(50) NOT NULL,
    capture_mode VARCHAR(50) NOT NULL,
    notes TEXT
);


select * from images;
select * from parts; 
select * from camera;
select * from metadata;

INSERT INTO part (part_name, part_number, description)
VALUES ('Sample Part', 'SP001', 'This is a sample part.');

INSERT INTO camera (device_model, location, serial_number)
VALUES ('Beckhoff Camera 1080p', 'Assembly Line A', 'CAM001');

INSERT INTO image (file_path, file_name, file_type, image_size, captured_at, part_id, camera_id)
VALUES ('http://localhost:9000/part-images/sample.jpg', 'sample.jpg', 'JPEG', 123456, NOW(), 1, 1);

INSERT INTO metadata (image_id, resolution, capture_mode, notes)
VALUES (1, '1920x1080', 'Auto', 'Test image for quality check.');