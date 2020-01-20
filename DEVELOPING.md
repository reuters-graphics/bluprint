![Reuters](./badge.svg)

<br />
<img src="logo.svg" width="300" alt="bluprint logo" />
<br />

## Developing actions

Developers can create new actions in `lib/actions/` following the pattern of other actions. Remember, your action must be able to be described using JSON and **should be validated using JSON schema**.

Be sure to write a test for your action in `test/actions/`. (Tests for this library are all performed in memory using [memfs](https://www.npmjs.com/package/memfs).)
