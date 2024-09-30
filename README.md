# tree-sitter-pss
PSS grammar for tree-sitter

### This repository is forked from drom/tree-sitter-pss, the changes are:
* uncomment some syntax items
* add conflict processing
* add the support for triple quoted string
* fix the ERROR in the internal pss testing. I don't check the update against PSS LRM, so there might be some misleadings.

### NVIM usage
The queries for NIVM is add in queries director inside repository: yuhaos/nvim.config
There is not plan to integrate to nvim-treesitter since we are lacking of testing code.

If you want to install in nvim, add such code in init.lua, and using ":TSInstall pss" is fine.

require("nvim-treesitter").setup()
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.pss = {
  install_info = {
    url = "https://github.com/yuhaos/tree-sitter-pss.git", -- local path or git repo
    files = {"src/parser.c"}, -- note that some parsers also require src/scanner.c or src/scanner.cc
  },
  filetype = "pss", -- if filetype does not match the parser name
}

NVIM doesn't have any pss support, it is suggested add PSS support by the following two steps:
* create a directory names ftplugin, copy $NVIM/share/nvim/runtime/ftplugin/c.vim into this directory, and rename it to "pss.nvim". $NVIM is the intall directory of nvim, if you run "which nvim", it should located in $NVIM/bin/nvim
* add the following line into init.lua:
  vim.filetype.add({
  extension = {
    pss = "pss",
  }
})
