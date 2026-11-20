
export function authorizeModification(req, res, next) {
  const requestedUserId = Number(req.params.userId);

  const isParent = req.user.role === "parent";

  const isOwnWatchlist =
    req.user.role === "child" &&
    Number(req.user.id) === requestedUserId;

  if (!isParent && !isOwnWatchlist) {
    return res.status(403).json({
      error: "Access denied"
    });
  }

  next();
}
