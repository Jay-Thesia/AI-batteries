import { commentService } from "./comment.service.js";

/**
 * Comment controllers — thin HTTP adapters over the service.
 */
export const commentController = {
  list(_req, res) {
    const comments = commentService.findAll().map((comment) => {
      return commentService.toPublic(comment);
    });

    return res.status(200).json({ comments });
  },

  create(req, res) {
    try {
      const comment = commentService.create(req.body ?? {});
      return res.status(201).json(commentService.toPublic(comment));
    } catch (error) {
      const status = error.statusCode ?? 500;
      return res.status(status).json({ error: error.message });
    }
  },
};
