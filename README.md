# Display Babelio catalogue enrichments in Primo

[Babelio.com](https://babelio.com) is a French social cataloguing service and book review aggregator, similar to LibraryThing or Goodreads.

Babelio content such as user ratings and reviews, published reviews, linked media, etc. can be integrated on library public access catalogues 
through the Babelthèque service. This service originally relies on content injected in `<iframe>` elements by external JavaScript code maintained
by Babelio.com. However, this approach does not work well in Primo, due to security limitations imposed by the AngularJS framework on external content.

Instead, this module retrieves Babelio content through an API service that is currently being developed, and displays it using the customization
mechanism provided by Primo views.

This module was developed for the [Renouvaud library network](https://www.bcu-lausanne.ch/en/mandats/) and is currently under development.

Access to the Babelio API is restricted by the vendor. For this reason, API details have been suppressed from this public repository.