import { postService } from "./post.service.js";

/**
 * Post controllers — thin HTTP adapters over services.
 */
export const postController = {
  list(_req, res) {
    return res.status(200).json(postService.findAll());
  },

  getById(req, res) {
    const post = postService.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  },

  create(req, res) {
    const { title, authorId } = req.body ?? {};

    if (!title || !authorId) {
      return res.status(400).json({
        error: "Both title and authorId are required",
      });
    }

    try {
      const post = postService.create({ title, authorId });
      return res.status(201).json(post);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  },
};
