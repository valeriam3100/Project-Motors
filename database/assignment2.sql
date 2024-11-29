-- Insertar el nuevo registro de Tony Stark account
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';
DELETE FROM account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';
-- Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';
-- Use an inner join to select the make and model fields from the inventory table
SELECT
    i.inv_make,
    i.inv_model,
    c.classification_name
FROM
    inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE
    c.classification_name = 'Sport';
--Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query.

UPDATE inventory
SET 
    inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');
