# Annotate Reek GitHub Action

GitHub Action for creating annotations from Reek results JSON file

## Usage

```yml
name: Reek

on: push

jobs:
  reek:
    name: Reek
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-ruby@v1
        with:
          ruby-version: '2.7'
      - run: gem install reek --no-doc
      - run: reek --format json > reek.json
      - uses: duderman/reek-annotate-action@v0.1.0
        if: ${{ failure() }}
```
