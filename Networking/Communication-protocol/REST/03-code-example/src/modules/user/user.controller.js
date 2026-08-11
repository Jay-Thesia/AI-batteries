import { userService } from "./user.service.js";
import { postService } from "../post/post.service.js";

/**
 * User controllers — thin HTTP adapters over services.
 */
export const userController = {
  list(_req, res) {
    return res.status(200).json(userService.findAll());
  },

  getById(req, res) {
    const user = userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  },

  listPosts(req, res) {
    const user = userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(postService.findByAuthorId(user.id));
  },
};
