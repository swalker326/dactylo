import { relations } from 'drizzle-orm';
import { users } from './users';
import { videos } from './videos';
import { votes } from './votes';
import { rolesToUsers } from './roles-to-users';
import { userImages } from './user-images';
import { passwords } from './passwords';
import { sessions } from './sessions';
import { connections } from './connections';
import { favorites } from './favorites';
import { reports } from './reports';
import { searches } from './searches';
import { requests } from './requests';

export const usersRelations = relations(users, (helpers) => ({ uploadedVideos: helpers.many(videos, { relationName: 'UserToVideo' }), votes: helpers.many(votes, { relationName: 'UserToVote' }), roles: helpers.many(rolesToUsers), image: helpers.one(userImages, { relationName: 'UserToUserImage', fields: [ users.id ], references: [ userImages.userId ] }), password: helpers.one(passwords, { relationName: 'PasswordToUser', fields: [ users.id ], references: [ passwords.userId ] }), sessions: helpers.many(sessions, { relationName: 'SessionToUser' }), connections: helpers.many(connections, { relationName: 'ConnectionToUser' }), favorites: helpers.many(favorites, { relationName: 'FavoriteToUser' }), reports: helpers.many(reports, { relationName: 'ReportToUser' }), searches: helpers.many(searches, { relationName: 'SearchToUser' }), requests: helpers.many(requests, { relationName: 'RequestToUser' }) }));