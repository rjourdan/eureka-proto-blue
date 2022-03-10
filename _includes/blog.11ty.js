const Image = require("@11ty/eleventy-img");

exports.render = async function(data) {
  const {hero, heroCropMode, heroColor} = data;
  const backgroundPosition = cropModeToPosition(heroCropMode);

  const {jpeg} = await Image(hero, {widths:[1080]});
  const heroImage = jpeg[0];

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="description" content="${data.description}">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy"
            content="default-src 'unsafe-inline' 'self'; img-src 'self' https://*; child-src 'none'; font-src fonts.gstatic.com;style-src 'unsafe-inline' 'self' fonts.googleapis.com;">
      <link rel="stylesheet" href="/static/styles.css">
      <link rel="preconnect" href="https://fonts.gstatic.com">
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <title>${data.title}</title>
      <script defer="defer" src="/static/main.353add58.js"></script>
    </head>
    <body>
      <header id="topbar"></header>
      <div class="content-banner" style="background-image:url(${heroImage.url}); background-size:cover; ${backgroundPosition};">
        <h1 class="${heroColorToFGStyle(heroColor)}">${data.title}</h1>
      </div>

      <div class="content">
        <div id="content-before"></div>
        
        <div class="content-wrapper">
        ${data.content}
        </div>
        <div id="content-after"></div>
      </div>
      

      <footer id="site-footer">
        <p>The content of this page is licensed under the <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 License</a>, and code samples are licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache 2.0 License</a>.</p>
        <p>Privacy | Site Terms | Cookie Preferences | © 2022, Amazon Web Services, Inc. or its affiliates. All rights reserved.</p>
      </footer>
    </body>
  </html>`;
};

function cropModeToPosition(cropMode) {
  if (cropMode === "top") {
    return "background-position: 0 0";
  }
  if (cropMode === "bottom") {
    return "background-position: 0 100%";
  }
  return "background-position: center";
}

function heroColorToFGStyle(heroColor) {
  if (heroColor === "light") {
    return "dark-fg";
  }
  return "light-fg";
}