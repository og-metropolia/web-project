let navbarLogoUrl = new URL('../../img/logo.png', document.baseURI).href;

document.write(`
<nav class="nav">
  <ul>
    <li><img id="logo" src="${navbarLogoUrl}" alt="OG Logistic Services logo" /></li>
    <li><a href="./">ETUSIVU</a></li>
    <li><a href="pages/yhteystiedot">YHTEYSTIEDOT</a></li>
    <li><a href="pages/tietoa-meista">MEISTÄ</a></li>
    <li><a href="pages/paastolaskuri/">PÄÄSTÖLASKURI</a></li>
  </ul>
</nav>
`);