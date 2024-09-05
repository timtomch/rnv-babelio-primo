# Display Babelio catalogue enrichments in Primo

[Babelio.com](https://babelio.com) is a French social cataloguing service and book review aggregator, similar to LibraryThing or Goodreads.

Babelio content such as user ratings and reviews, published reviews, linked media, etc. can be integrated on library public access catalogues 
through the Babelthèque service. This service originally relies on content injected in `<iframe>` elements by external JavaScript code maintained
by Babelio.com. However, this approach does not work well in Primo, due to security limitations imposed by the AngularJS framework on external content.

Instead, this module retrieves Babelio content through an API service, and displays it using the customization
mechanism provided by Primo views.

Currently, only the following features are supported:
* Global star rating
* Literary awards
* User reviews and individual ratings
* User-submitted citations

The first 3 reviews and citations are displayed within the Primo record, or inside a paginated modal window when there are more. This value can be increased
up to 5, which is the maximum number of reviews returned by an initial call to the Babelio API. This value can be customized by changing the value assigned to
the `displayLimit` variable.

Binding directives: `prm-search-result-availability-line-after` (for star rating brief display) and `prm-action-list-after` (for main display).

## How to enable the module

### JavaScript

Copy the content of [`rnv-babelio-primo.js`](js/rnv-babelio-primo.js) to your `custom.js` file.

Make sure to add this content *after* the following lines

```JavaScript
(function () {
  'use strict';
  'use strict';
  
  /* Paste the module contents here */
```

and *before* the one that looks like this

```JavaScript
})();
```

On the Renouvaud network, this code is deployed on the central package. Therefore, some logic has been included to control on which view the module is
enabled (around line 55 of [`rnv-babelio-primo.js`](js/rnv-babelio-primo.js#L55)). Be sure to alter this logic to your own use case.

### HTML templates

Place the HTML templates included inside a `babelio` directory within your view's `html` directory. Your view's file structure should look something like this

```
VIEW_CODE
    css
        custom.css
    html
        babelio
            babelio_de.html
            babelio_en.html
            ...
        email
        homepage
    img
    js
        custom.js
```

### CSS

You will also need to add [the CSS snippet included](css/rnv-babelio.css) to your `custom.css` file. You can customize it to vary
colours, text size, etc.

### API proxy

Babelio is a paid service and its API is only available to subscribers. Access to the API is controlled through an API key that needs to be hashed together
with other query parameters (including the ISBN) and provided as part of the request. Since this process relies on a secret key, the hash cannot be computed
in JavaScript, which is openly available. To resolve this issue, a simple PHP proxy was developed.

To help prevent unauthorized requests to the proxy, the HTTP referrer value is compared against a list of allowed URLs. The idea is to only whitelist the URL of your
own Primo instance (as well as any sandboxes and local development environments) and prevent requests from other sources. It must be noted that this approach is not perfect, 
as the HTTP referrer value can be spoofed.

In order to deploy the proxy, place the included PHP file [babelio_gateway.php](babelio_gateway.php) on a public server and provide the URL to that file as base URL
at the top of the Angular module's `fetchBabelioData()` function.

Also edit the following lines in the PHP file:
- Set the `$token` variable to your secret Babelio token key.
- Set the `$id` variable to your Babelio customer/library ID.
- Edit the `$allowed_referrers` array to include all domain names from which API queries should be allowed. This typically is the base URL of your production and sandbox instances. To enable local testing using the [Primo development environment](https://github.com/ExLibrisGroup/primo-explore-devenv), make sure to include `http://localhost:8003` (or similar) to that array.
- Alternatively, set the `$disable_referrer_check` variable to `true` to disable referral checking (all requests will be granted).

## Credits
This module was developed for the [Renouvaud library network](https://www.bcu-lausanne.ch/en/mandats/).

The PHP proxy file includes code shared by Babelio.