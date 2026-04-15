# vogopang-b2c-app

Vogopang B2C mobile app built with Expo + React Native + TypeScript.

## Current Setup

- Expo Router based file routing
- Bottom tabs: Home, Search, Library, More
- Dynamic route: `/book/[id]`

## Run

```bash
npm install
npm run start
```

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Key Paths

- `app/_layout.tsx`: Root stack layout
- `app/(tabs)/_layout.tsx`: Bottom tab layout
- `app/(tabs)/index.tsx`: Home starter screen
- `app/book/[id].tsx`: Book detail starter screen
