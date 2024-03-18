import * as term from "./term";
import * as sign from "./sign";
import * as video from "./video";
import * as report from "./report";
import * as favorite from "./favorite";
import * as user from "./user";
import * as vote from "./vote";
import * as category from "./category";
import * as videoStatus from "./video-status";
import * as voteType from "./vote-type";
import * as userImage from "./user-image";
import * as search from "./search";
import * as searchSign from "./search-sign";
import * as requestStatus from "./request-status";
import * as requestType from "./request-type";
import * as request from "./request";
import * as password from "./password";
import * as session from "./session";
import * as permission from "./permission";
import * as role from "./role";
import * as verification from "./verification";
import * as connection from "./connection";
import * as termRelations from "./term-relations";
import * as signRelations from "./sign-relations";
import * as videoRelations from "./video-relations";
import * as reportRelations from "./report-relations";
import * as favoriteRelations from "./favorite-relations";
import * as userRelations from "./user-relations";
import * as voteRelations from "./vote-relations";
import * as categoryRelations from "./category-relations";
import * as videoStatusRelations from "./video-status-relations";
import * as voteTypeRelations from "./vote-type-relations";
import * as userImageRelations from "./user-images-relations";
import * as searchRelations from "./search-relations";
import * as searchSignRelations from "./search-sign-relations";
import * as requestStatusRelations from "./request-status-relations";
import * as requestTypeRelations from "./request-type-relations";
import * as requestRelations from "./request-relations";
import * as passwordRelations from "./password-relations";
import * as sessionRelations from "./session-relations";
import * as permissionRelations from "./permission-relations";
import * as roleRelations from "./role-relations";
import * as connectionRelations from "./connection-relations";
import * as categoryToSign from "./category-to-sign";
import * as signToSign from "./sign-to-sign";
import * as roleToUser from "./role-to-user";
import * as permissionToRole from "./permission-to-role";
import * as categoryToSignRelations from "./category-to-sign-relations";
import * as signToSignRelations from "./sign-to-sign-relations";
import * as roleToUserRelations from "./role-to-user-relations";
import * as permissionToRoleRelations from "./permission-to-role-relations";

export const schema = {
	...term,
	...sign,
	...video,
	...report,
	...favorite,
	...user,
	...vote,
	...category,
	...videoStatus,
	...voteType,
	...userImage,
	...search,
	...searchSign,
	...requestStatus,
	...requestType,
	...request,
	...password,
	...session,
	...permission,
	...role,
	...verification,
	...connection,
	...termRelations,
	...signRelations,
	...videoRelations,
	...reportRelations,
	...favoriteRelations,
	...userRelations,
	...voteRelations,
	...categoryRelations,
	...videoStatusRelations,
	...voteTypeRelations,
	...userImageRelations,
	...searchRelations,
	...searchSignRelations,
	...requestStatusRelations,
	...requestTypeRelations,
	...requestRelations,
	...passwordRelations,
	...sessionRelations,
	...permissionRelations,
	...roleRelations,
	...connectionRelations,
	...categoryToSign,
	...signToSign,
	...roleToUser,
	...permissionToRole,
	...categoryToSignRelations,
	...signToSignRelations,
	...roleToUserRelations,
	...permissionToRoleRelations,
};
