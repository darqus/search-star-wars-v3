#!/bin/bash

eslint --fix "**/*.{ts,mts,js,mjs,cjs,vue}"
stylelint --fix "**/*.scss"
