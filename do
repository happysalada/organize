#!/run/current-system/sw/bin/oil

proc dev() {
  pnpm dev
}

proc build() {
  pnpm build
}

proc deploy() {
  wrangler publish
}

proc update_deps() {
  pnpm up --interactive --latest
}

@ARGV