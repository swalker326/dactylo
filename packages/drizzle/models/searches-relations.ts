import { relations } from 'drizzle-orm';
import { searches } from './searches';
import { users } from './users';
import { searchSigns } from './search-signs';

export const searchesRelations = relations(searches, (helpers) => ({ user: helpers.one(users, { relationName: 'SearchToUser', fields: [ searches.userId ], references: [ users.id ] }), results: helpers.many(searchSigns, { relationName: 'SearchToSearchSign' }) }));