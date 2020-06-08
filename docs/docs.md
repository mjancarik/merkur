---
layout: docs
title: Merkur documentation
---

# Merkur

Merkur widget can be small button, some section of page or all web page. It's only on your imagine and needs. But common scenario can be that you have got already some existing application and you need adding new part. You can add to the existing monolithic system or create merkur widget like front-end microservice.

<img class="responsive" src="{{ '/assets/images/merkur-concept.jpg?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur - concept" />

The `App container` can be your SPA application written with VueJS, Angular or React. The container can also be your MPA application written with Symphony or Django. You can [integrate]({{ '/docs/integration-with-app' | relative_url }}) Merkur widget with any web application. 

You can use more widgets on one page. We use `Feed` widget and `Subcribe` widget. Both can be written with same framework or different framework. You can also use only plain Javascript and add events to DOM.
