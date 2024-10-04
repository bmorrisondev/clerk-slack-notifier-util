create table shipped_items
(
  id char(36) not null primary key,
  type int not null,
  name text not null,
  sent_on timestamp
);
