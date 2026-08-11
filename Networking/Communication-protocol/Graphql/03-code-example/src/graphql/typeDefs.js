import { rootTypeDefs } from "./root.typeDefs.js";
import { userTypeDefs } from "../modules/user/user.typeDefs.js";
import { postTypeDefs } from "../modules/post/post.typeDefs.js";

export const typeDefs = [rootTypeDefs, userTypeDefs, postTypeDefs];
