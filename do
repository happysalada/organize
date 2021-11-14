#!/run/current-system/sw/bin/oil

proc dev() {
  pnpm dev
}

proc build() {
  rm -rf build
  pnpm build
}

proc prepare(name) {
  for file in ./build/**/**/*.js; do
    replace_env_vars $name $file
  done
}

proc replace_env_vars(name, file) {
  sd 'apiUrl:".*"' "apiUrl:\"https://$name.valueflows.union.rocks\"" $file
}

proc deploy(name) {
  prepare $name
  wrangler publish --env $name
}

proc update_deps() {
  pnpm up --interactive --latest
}

@ARGV