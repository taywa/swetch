/** @type {(file_path: string) => Promise<user_options>} */
export const read_options_file = async file_path => {
  const exports = await import(file_path)

  const options = exports.options ?? exports.default

  if (!options) {
    throw new Error(
      `missing export in \`${file_path}\`. add a named (\`export const options = {}\`) or default (\`export default {}\`) export to the file.`
    )
  }

  if (!options.resolve_url) {
    throw new Error(
      `missing \`resolve_url\` option (\`${file_path}\`). add a property called \`resolve_url\` of type function to its export.`
    )
  }

  return options
}
