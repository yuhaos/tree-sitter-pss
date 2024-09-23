package tree_sitter_pss_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_pss "github.com/tree-sitter/tree-sitter-pss/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pss.Language())
	if language == nil {
		t.Errorf("Error loading Pss grammar")
	}
}
