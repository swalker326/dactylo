import { relations } from 'drizzle-orm';
import { userImages } from './user-images';
import { users } from './users';

export const userImagesRelations = relations(userImages, (helpers) => ({ user: helpers.one(users, { relationName: 'UserToUserImage', fields: [ userImages.userId ], references: [ users.id ] }) }));