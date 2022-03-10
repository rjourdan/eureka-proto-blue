module.exports = config => {
  config.addPassthroughCopy("static");
  config.addPassthroughCopy("favicon.ico");

  config.addPassthroughCopy("readme/**/*.jpg");
  config.addPassthroughCopy("readme/**/*.jpeg");
  config.addPassthroughCopy("readme/**/*.png");
  config.addPassthroughCopy("readme/**/*.webp");

  config.addPassthroughCopy("content/**/*.jpg");
  config.addPassthroughCopy("content/**/*.jpeg");
  config.addPassthroughCopy("content/**/*.png");
  config.addPassthroughCopy("content/**/*.webp");
};