PRAGMA foreign_keys = true;

CREATE TABLE IF NOT EXISTS genomes(
	genome_id INT,
	genome_name TEXT,
	PRIMARY KEY (genome_id)
);

CREATE TABLE IF NOT EXISTS variants_observed(
	variant_id INT,
	genome_id INT,
	quality INT,
	filter TEXT,
	info_id INT,
	PRIMARY KEY (variant_id, genome_id),
	FOREIGN KEY (genome_id)
		REFERENCES genomes (genome_id)
);

CREATE TABLE IF NOT EXISTS variants(
	variant_id INT,
	var_type TEXT,
	reference TEXT,
	alteration TEXT,
	position INT,
	chomosome INT,
	PRIMARY KEY (variant_id)
	FOREIGN KEY (variant_id)
		REFERENCES variants_observed(variant_id)
);

CREATE TABLE IF NOT EXISTS infos(
	info_id INT,
	info_format TEXT,
	info_values TEXT,
	PRIMARY KEY (info_id)
	FOREIGN KEY (info_id)
		REFERENCES variants_observed(variant_id)
);

INSERT INTO genomes (genome_id, genome_name)
VALUES(1, 7208);