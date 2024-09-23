import XCTest
import SwiftTreeSitter
import TreeSitterPss

final class TreeSitterPssTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_pss())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Pss grammar")
    }
}
