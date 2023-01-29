PRAGMA foreign_keys = true;

CREATE TABLE IF NOT EXISTS chromosomes(
	chromosome_id INT,
	genome_id TEXT NOT NULL,
	PRIMARY KEY (chromosome_id)
	);

CREATE TABLE IF NOT EXISTS variants_observed(
	variant_id INT,
	chromosome_id INT,
	position INT NOT NULL,
	
	PRIMARY KEY (variant_id, chromosome_id),
	FOREIGN KEY (chromosome_id)
		REFERENCES chromosomes (chromosome_id)
);