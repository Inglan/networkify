![hackatime](https://hackatime-badge.hackclub.com/U0923H02Y3B/networkify)


# networkify

Visualize the network of people you know on Spotify as a graph. This app maps out your connections by discovering followers and followings and displaying them in a graph.

Important: This is an experimental tool that may violate Spotify’s Terms of Service. It may stop working at any time. Use at your own risk.

## Demo video
https://github.com/user-attachments/assets/00220411-a1be-4a0c-a3ce-2a3ade7826b9

## How it works
- You provide a spotify token (which is generated when spotify loads, and is valid for a short time)
- The app uses undocumented APIs to fetch who you follow and who follows you
- You can press run on all nodes to fetch everyone discovered's followers and followings
- You can keep doing this to build the network
- No data is stored server side

## Tech stack
- React
- Next.js
- Vecel
- Reagraph
- shadcn-ui
- TailwindCSS
- Zustand

## Running locally
```shell
pnpm install


# Dev server
pnpm dev




# Build
pnpm build





# Serve
pnpm start




```

## Roadmap


- [x] Remove recursion?
- [x] Better documentation
- [x] better ux. onboarding?
- [ ] Better error handling
- [ ] Handling when follows are set to private
- [x] Better UI
- [x] Showing lookup progress on graph nodes? color coding?
- [x] Showing ongoing lookups
- [x] ~~Setting limits in recursive mode~~ recursive mode removed
- [x] ~~Stop button~~ recursive mode removed
- [x] Save/restore state
- [x] save state in localstorage
- [x] Show node count
- [x] Search
- [x] Isolate node
- [x] list of nodes
- [x] node context menu
- [x] better mobile support
- [x] Seperate everything into components












