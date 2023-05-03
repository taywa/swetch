/**
 * merge a set of options objects, left-to-right (left is default, right overwrites)
 *
 * works like Object.assign, but without overriding explicitly falsy values: `merge_options({ port: null }, { port: 8000 }, { port: undefined })` results in `{ port: 8000 }`.
 *
 * @type {(...optionss: Partial<options>[]) => Partial<options> }
 */
export const merge_options = (...optionss) => {
  /** @type {(keyof options)[]} */
  const keys_with_duplicates = optionss
    .map(options => /** @type {(keyof options)[]} */ (Object.keys(options)))
    .flat()
  const key_set = new Set(keys_with_duplicates)
  const keys = Array.from(key_set.values())

  /** @type {Partial<options>} */
  const result = {}

  for (const key of keys) {
    for (const options of optionss) {
      const value = options[key]
      if (value) {
        result[key] = value
      }
    }
  }

  return result
}
