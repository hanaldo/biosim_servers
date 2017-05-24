CREATE TABLE `biosim` (
`name` varchar(255) PRIMARY KEY,
  `file_path` varchar(255) NOT NULL,
  `length` bigint(20) NOT NULL,
  `my_time` timestamp NOT NULL
);DROP TABLE IF EXISTS TEST;