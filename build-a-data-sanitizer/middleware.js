
export function inputCleaner(req, res, next) {
  // Convert username to lowercase
  if (req.body.username) {
    req.body.username = req.body.username.toLowerCase();
  }

  // Strip HTML tags from comment
  if (req.body.comment) {
    req.body.comment = req.body.comment.replace(/<[^>]*>/g, "");
  }

  next();
}

export function inputValidator(req, res, next) {
  // Validate username length
  if (req.body.username && req.body.username.length >= 3) {
    return next();
  }

  // Redirect if username is invalid
  return res.redirect(
    "/form?error=Username%20must%20be%20at%20least%203%20characters."
  );
}
