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
	var_subtype TEXT,
	reference TEXT,
	alteration TEXT,
	position INT,
	chromosome INT,
	PRIMARY KEY (variant_id)
);

CREATE TABLE IF NOT EXISTS infos(
	info_id INT,
	extra_info TEXT,
	info_format TEXT,
	info_values TEXT,
	PRIMARY KEY (info_id)
);