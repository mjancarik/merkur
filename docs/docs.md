---
layout: docs
title: Merkur documentation
---

# Merkur

Merkur widget can be a small button, a section of a page, or an entire page of your website. A common scenario: you have an existing application and need to add a new block. You could add to the existing monolithic system... or you you can create a merkur widget, a reusable front-end microservice.

Consider this layout:

<img class="responsive" src="{{ '/assets/images/merkur-concept.jpg?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur - concept" />

The `App container` can be an SPA application written with VueJS, Angular or React. It can also be a MPA application written with Symphony or Django. You can [integrate]({{ '/docs/integration-with-app' | relative_url }}) Merkur widget with any web application. 

You may use more than one widget on a page. Here we use a `Feed` widget and a `Subcribe` widget. Both can be written with the same framework, or they can use completely different technologies. You can also use only plain Javascript native browser APIs, leveraging the capabilities of modern browsers.
