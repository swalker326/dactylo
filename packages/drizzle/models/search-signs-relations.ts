import { relations } from 'drizzle-orm';
import { searchSigns } from './search-signs';
import { searches } from './searches';
import { signs } from './signs';

export const searchSignsRelations = relations(searchSigns, (helpers) => ({ search: helpers.one(searches, { relationName: 'SearchToSearchSign', fields: [ searchSigns.searchId ], references: [ searches.id ] }), sign: helpers.one(signs, { relationName: 'SignToSearchSigns', fields: [ searchSigns.signId ], references: [ signs.id ] }) }));