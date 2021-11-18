#!/run/current-system/sw/bin/oil

proc dev() {
  pnpm dev
}

proc build() {
  rm -rf build
  pnpm build
}

proc replace_env_vars(name) {
  sd 'VITE_API_URL=".*"' "VITE_API_URL=\"https://$name-vf.union.rocks\"" .env.production
}

proc deploy(name) {
  replace_env_vars $name
  build
  wrangler publish --env $name
}

proc update_deps() {
  pnpm up --interactive --latest
}

@ARGV