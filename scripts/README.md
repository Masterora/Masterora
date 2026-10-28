Build the current scene and both theme replays:

    node scripts/bake-physics.mjs

This runs build-scene.mjs using the same bumper and wall coordinates as physics.mjs, then records a 24-second simulation and generates the light palette.

Validate gameplay:

    node --test tests/*.test.mjs

Icon paths are vendored in assets/icons; manifest.json stores path centers and uniform scale values. The terminal asset is independent and must remain unchanged.
