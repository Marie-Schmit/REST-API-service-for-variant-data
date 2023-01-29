PRAGMA foreign_keys = true;

CREATE TABLE IF NOT EXISTS chromosomes(
	chromosome_id INT,
	genome_id INT NOT NULL,
	PRIMARY KEY (chromosome_id)
);

CREATE TABLE IF NOT EXISTS variants_observed(
	variant_id INT,
	chromosome_id INT,
	position INT NOT NULL,
	quality INT,
	filter TEXT,
	genotype INT,
	genotype_quality INT,
	read_depth INT,
	PRIMARY KEY (variant_id, chromosome_id),
	FOREIGN KEY (chromosome_id)
		REFERENCES chromosomes (chromosome_id)
);

CREATE TABLE IF NOT EXISTS variants(
	variant_id INT,
	var_type STRING,
	reference STRING,
	alteration STRING,
	PRIMARY KEY (variant_id),
	FOREIGN KEY (variant_id)
		REFERENCES variants_observed (variant_id)
);

INSERT INTO chromosomes (chromosome_id, genome_id)
VALUES(1, 7208);