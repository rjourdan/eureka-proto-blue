module.exports = config => {
  config.addPassthroughCopy("static");
  config.addPassthroughCopy("img");
  config.addPassthroughCopy("favicon.ico");
  config.addPassthroughCopy({"images": "img"});

  config.addPassthroughCopy("**/*.jpg");
};