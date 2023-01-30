PRAGMA foreign_keys = true;

CREATE TABLE IF NOT EXISTS genomes(
	genome_id INTEGER,
	genome_name TEXT,
	PRIMARY KEY (genome_id)
);

CREATE TABLE IF NOT EXISTS variants_observed(
	variant_id INTEGER NOT NULL,
	genome_id INTEGER NOT NULL,
	quality INTEGER,
	filter TEXT,
	info_id INTEGER,
	PRIMARY KEY (variant_id, genome_id),
	FOREIGN KEY (genome_id)
		REFERENCES genomes (genome_id),
	FOREIGN KEY (info_id)
		REFERENCES infos(info_id),
	FOREIGN KEY (variant_id)
		REFERENCES variants(variant_id)
);

CREATE TABLE IF NOT EXISTS variants(
	variant_id INTEGER NOT NULL,
	var_type TEXT,
	var_subtype TEXT,
	reference TEXT,
	alteration TEXT,
	position INTEGER,
	chromosome INTEGER,
	PRIMARY KEY (variant_id)
);

CREATE TABLE IF NOT EXISTS infos(
	info_id INTEGER,
	extra_info TEXT,
	info_format TEXT,
	info_values TEXT,
	PRIMARY KEY (info_id)
);