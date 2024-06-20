"use client";
import { createMedia } from "@artsy/fresnel";

let ExampleAppMedia = createMedia({
  breakpoints: {
    sm: 0,
    md: 768,
    lg: 1024,
    xl: 1200,
  },
});

// Make styles for injection into the header of the page
export let mediaStyles = ExampleAppMedia.createMediaStyle();

export let { Media, MediaContextProvider } = ExampleAppMedia;
