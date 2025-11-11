import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  numeric,
  index
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey()
    .notNull()
    .defaultRandom(),
  email   : varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 })
});

export type User = InferSelectModel<typeof user>;

export const historicalFigureAnalysis = pgTable('historical_figure_analysis', {
  name     : text('name').primaryKey(),
  analysis : json('analysis').notNull(),
  createdAt: timestamp('created_at').notNull()
    .defaultNow()
});

export type HistoricalFigureAnalysis = InferSelectModel<typeof historicalFigureAnalysis>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey()
    .notNull()
    .defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title    : text('title').notNull(),
  userId   : uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  analyzedPersonName: text('analyzedPersonName')
    .notNull()
    .references(() => historicalFigureAnalysis.name)
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey()
    .notNull()
    .defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role     : varchar('role').notNull(),
  content  : json('content').notNull(),
  createdAt: timestamp('createdAt').notNull()
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull()
  },
  table => ({ pk: primaryKey({ columns: [table.chatId, table.messageId] }) })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull()
      .defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title    : text('title').notNull(),
    content  : text('content'),
    kind     : varchar('text', { enum: ['text', 'code'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id)
  },
  table => ({ pk: primaryKey({ columns: [table.id, table.createdAt] }) })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull()
      .defaultRandom(),
    documentId       : uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText     : text('originalText').notNull(),
    suggestedText    : text('suggestedText').notNull(),
    description      : text('description'),
    isResolved       : boolean('isResolved').notNull()
      .default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull()
  },
  table => ({
    pk         : primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns       : [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt]
    })
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const pantheonPerson = pgTable('pantheon_person', {
  id        : integer('id').primaryKey(),
  wdId      : text('wd_id'),
  wpId      : integer('wp_id'),
  slug      : text('slug').notNull(),
  name      : text('name').notNull(),
  occupation: text('occupation').notNull(),
  domain    : text('domain'),
  era       : text('era'),
  probRatio : numeric('prob_ratio', {
    precision: 15,
    scale    : 6
  }),
  gender : varchar('gender', { length: 1 }),
  twitter: text('twitter'),
  alive  : boolean('alive').notNull()
    .default(false),
  l     : integer('l'),
  hpiRaw: numeric('hpi_raw', {
    precision: 15,
    scale    : 6
  }),

  // Birth info
  birthplaceName: text('birthplace_name'),
  birthplaceLat : numeric('birthplace_lat', {
    precision: 10,
    scale    : 7
  }),
  birthplaceLon: numeric('birthplace_lon', {
    precision: 10,
    scale    : 7
  }),
  birthplaceGeonameid  : integer('birthplace_geonameid'),
  birthplaceCountry    : text('birthplace_country'),
  birthplaceCountryCode: varchar('birthplace_country_code', { length: 2 }),
  birthplaceContinent  : text('birthplace_continent'),
  birthdate            : text('birthdate'),
  birthyear            : integer('birthyear'),

  // Death info
  deathplaceName: text('deathplace_name'),
  deathplaceLat : numeric('deathplace_lat', {
    precision: 10,
    scale    : 7
  }),
  deathplaceLon: numeric('deathplace_lon', {
    precision: 10,
    scale    : 7
  }),
  deathplaceGeonameid: integer('deathplace_geonameid'),
  deathplaceCountry  : text('deathplace_country'),
  deathdate          : text('deathdate'),
  deathyear          : integer('deathyear'),

  // Geacron names
  birthplaceGeacronName: text('birthplace_geacron_name'),
  deathplaceGeacronName: text('deathplace_geacron_name'),

  // Metadata
  isGroup               : boolean('is_group').default(false),
  lUnderscore           : integer('l_'),
  age                   : integer('age'),
  nonEnPageViews        : integer('non_en_page_views'),
  coefficientOfVariation: numeric('coefficient_of_variation', {
    precision: 15,
    scale    : 6
  }),
  hpi: numeric('hpi', {
    precision: 15,
    scale    : 6
  })
}, table => ({
  nameIdx               : index('pantheon_name_idx').on(table.name),
  hpiIdx                : index('pantheon_hpi_idx').on(table.hpi),
  domainIdx             : index('pantheon_domain_idx').on(table.domain),
  eraIdx                : index('pantheon_era_idx').on(table.era),
  occupationIdx         : index('pantheon_occupation_idx').on(table.occupation),
  birthplaceCountryIdx  : index('pantheon_birthplace_country_idx').on(table.birthplaceCountry),
  birthplaceContinentIdx: index('pantheon_birthplace_continent_idx').on(table.birthplaceContinent),
  birthyearIdx          : index('pantheon_birthyear_idx').on(table.birthyear),
  aliveIdx              : index('pantheon_alive_idx').on(table.alive)
}));

export type PantheonPerson = InferSelectModel<typeof pantheonPerson>;
