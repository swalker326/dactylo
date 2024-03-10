import * as terms from "./terms";
import * as signs from "./signs";
import * as videos from "./videos";
import * as reports from "./reports";
import * as favorites from "./favorites";
import * as users from "./users";
import * as votes from "./votes";
import * as categories from "./categories";
import * as videoStatuses from "./video-statuses";
import * as voteTypes from "./vote-types";
import * as userImages from "./user-images";
import * as searches from "./searches";
import * as searchSigns from "./search-signs";
import * as requestStatuses from "./request-statuses";
import * as requestTypes from "./request-types";
import * as requests from "./requests";
import * as passwords from "./passwords";
import * as sessions from "./sessions";
import * as permissions from "./permissions";
import * as roles from "./roles";
import * as verifications from "./verifications";
import * as connections from "./connections";
import * as permissionToRoles from "./permission-to-roles";
import * as relatedSigns from "./related-signs";
import * as roleToUsers from "./role-to-users";
import * as signCategories from "./sign-categories";
import * as termsRelations from "./terms-relations";
import * as signsRelations from "./signs-relations";
import * as videosRelations from "./videos-relations";
import * as reportsRelations from "./reports-relations";
import * as favoritesRelations from "./favorites-relations";
import * as usersRelations from "./users-relations";
import * as votesRelations from "./votes-relations";
import * as categoriesRelations from "./categories-relations";
import * as videoStatusesRelations from "./video-statuses-relations";
import * as voteTypesRelations from "./vote-types-relations";
import * as userImagesRelations from "./user-images-relations";
import * as searchesRelations from "./searches-relations";
import * as searchSignsRelations from "./search-signs-relations";
import * as requestStatusesRelations from "./request-statuses-relations";
import * as requestTypesRelations from "./request-types-relations";
import * as requestsRelations from "./requests-relations";
import * as passwordsRelations from "./passwords-relations";
import * as sessionsRelations from "./sessions-relations";
import * as permissionsRelations from "./permissions-relations";
import * as rolesRelations from "./roles-relations";
import * as connectionsRelations from "./connections-relations";
import * as categoriesToSigns from "./categories-to-signs";
import * as signsToSigns from "./signs-to-signs";
import * as rolesToUsers from "./roles-to-users";
import * as permissionsToRoles from "./permissions-to-roles";
import * as categoriesToSignsRelations from "./categories-to-signs-relations";
import * as signsToSignsRelations from "./signs-to-signs-relations";
import * as rolesToUsersRelations from "./roles-to-users-relations";
import * as permissionsToRolesRelations from "./permissions-to-roles-relations";

export const schema = {
	...terms,
	...signs,
	...videos,
	...reports,
	...favorites,
	...users,
	...votes,
	...categories,
	...videoStatuses,
	...voteTypes,
	...userImages,
	...searches,
	...searchSigns,
	...requestStatuses,
	...requestTypes,
	...requests,
	...passwords,
	...sessions,
	...permissions,
	...roles,
	...verifications,
	...connections,
	...permissionToRoles,
	...relatedSigns,
	...roleToUsers,
	...signCategories,
	...termsRelations,
	...signsRelations,
	...videosRelations,
	...reportsRelations,
	...favoritesRelations,
	...usersRelations,
	...votesRelations,
	...categoriesRelations,
	...videoStatusesRelations,
	...voteTypesRelations,
	...userImagesRelations,
	...searchesRelations,
	...searchSignsRelations,
	...requestStatusesRelations,
	...requestTypesRelations,
	...requestsRelations,
	...passwordsRelations,
	...sessionsRelations,
	...permissionsRelations,
	...rolesRelations,
	...connectionsRelations,
	...categoriesToSigns,
	...signsToSigns,
	...rolesToUsers,
	...permissionsToRoles,
	...categoriesToSignsRelations,
	...signsToSignsRelations,
	...rolesToUsersRelations,
	...permissionsToRolesRelations,
};
