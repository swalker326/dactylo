import { relations } from 'drizzle-orm';
import { terms } from './terms';
import { signs } from './signs';

export const termsRelations = relations(terms, (helpers) => ({ signs: helpers.many(signs, { relationName: 'SignToTerm' }) }));