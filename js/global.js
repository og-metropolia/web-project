let navbarLogoUrl = new URL('../../img/logo.png', document.baseURI).href;

document.write(`
<nav class="nav">
  <ul>
    <li><img id="logo" src="${navbarLogoUrl}" alt="OG Logistic Services logo" /></li>
    <li><a href="../../sivut/etusivu/">ETUSIVU</a></li>
    <li><a href="../../sivut/yhteystiedot/">YHTEYSTIEDOT</a></li>
    <li><a href="../../sivut/tietoa-meista/">MEISTÄ</a></li>
    <li><a href="../../sivut/paastolaskuri/">PÄÄSTÖLASKURI</a></li>
  </ul>
</nav>
`);
