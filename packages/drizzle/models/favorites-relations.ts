import { relations } from "drizzle-orm";
import { favorites } from "./favorites";
import { users } from "./users";
import { videos } from "./videos";

export const favoritesRelations = relations(favorites, (helpers) => ({
  user: helpers.one(users, {
    relationName: "FavoriteToUser",
    fields: [favorites.userId],
    references: [users.id],
  }),
  video: helpers.one(videos, {
    relationName: "FavoriteToVideo",
    fields: [favorites.videoId],
    references: [videos.id],
  }),
}));
