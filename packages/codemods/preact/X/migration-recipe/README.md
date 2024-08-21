
This recipe provides a collection of codemods to help you migrate your codebase to [Preact X](https://preactjs.com/guide/v10/upgrade-guide). These codemods are designed to streamline the transition process by automating common code transformations.

## Codemods Included

The following codemods are included in this recipe:

1. **Replace `this.state` with `prevState`**  
   Converts instances of `this.state` to use `prevState` to align with Preact X best practices.

2. **Convert `props.children` to `childArray`**  
   Transforms `props.children` into a child array, which is the recommended structure in Preact X.

3. **Update Preact Import Source**  
   Updates import paths to the new Preact X syntax, ensuring that your imports align with the latest version.

4. **Convert Default Import to Namespace Import**  
   Replaces default imports with namespace imports (`import * as Preact from 'preact';`) to prevent potential issues and improve compatibility with Preact X.

