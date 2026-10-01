const crypto = require("crypto");

function etag(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex");

    const value = `"${hash}"`;

    res.setHeader("ETag", value);

    if (req.headers["if-none-match"] === value) {
      return res.status(304).send();
    }

    return originalJson(body);
  };

  next();
}

module.exports = etag;