import { relations } from 'drizzle-orm';
import { requestTypes } from './request-types';
import { requests } from './requests';

export const requestTypesRelations = relations(requestTypes, (helpers) => ({ Request: helpers.many(requests, { relationName: 'RequestToRequestType' }) }));