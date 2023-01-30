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
		REFERENCES genomes (genome_id),
	FOREIGN KEY (info_id)
		REFERENCES infos(info_id),
	FOREIGN KEY (variant_id)
		REFERENCES variants(variant_id)
);

CREATE TABLE IF NOT EXISTS variants(
	variant_id INT,
	var_type TEXT,
	reference TEXT,
	alteration TEXT,
	position INT,
	chromosome INT,
	PRIMARY KEY (variant_id)
);

CREATE TABLE IF NOT EXISTS infos(
	info_id INT,
	info_format TEXT,
	info_values TEXT,
	PRIMARY KEY (info_id)
);

INSERT INTO genomes (genome_id, genome_name)
VALUES(1, 7208);

INSERT INTO variants(variant_id, var_type, reference, alteration, position, chromosome)
VALUES(1, "InDel", "T", "TA", 6324, 1);

INSERT INTO infos(info_id, info_format, info_values)
VALUES(1, "GT:GQ:DP", "1|1:40:12");

INSERT INTO variants_observed(variant_id, genome_id, quality, filter, info_id)
VALUES(1, 1, 40, "PASS", 1);