'use strict';

function optseq() {
  return optional(prec.left(seq.apply(null, arguments)));
}

function repseq() {
  return repeat(prec.left(seq.apply(null, arguments)));
}

function sep1(separator, rule) {
  return prec.left(seq(
    rule,
    repeat(prec.left(seq(separator, rule)))
  ));
}

const rules = {

  // PSS 2.1
  // Annex B

  source_file: $ => repeat($.portable_stimulus_description),

  portable_stimulus_description: $ => choice(
    $.package_body_item,
    // $.package_declaration,
    // $.component_declaration
  ),

  // B.1 Package declarations

  package_declaration: $ => seq(
    'package', $.package_id_path,
    '{', repeat($.package_body_item), '}'
  ),

  package_id_path: $ => seq(
    $.id, // package_identifier
    optseq(
      '::',
      $.id // package_identifier
    )
  ),

  package_body_item: $ => choice(
    $.abstract_action_declaration,
    // $.struct_declaration,
    // $.enum_declaration,
    // $.covergroup_declaration,
    // $.function_decl,
    // $.import_class_decl,
    // $.procedural_function,
    // $.import_function,
    // $.target_template_function,
    // $.export_action,
    // $.typedef_declaration,
    // $.import_stmt,
    // $.extend_stmt,
    // $.const_field_declaration,
    $.component_declaration,
    $.package_declaration,
    // $.compile_assert_stmt,
    // $.package_body_compile_if,
    token(';') // $.stmt_terminator
  ),

  import_stmt: $ => seq(
    'import', $.package_import_pattern, ';'
  ),

  package_import_pattern: $ => seq(
    $.type_identifier, optional($.package_import_qualifier)
  ),

  package_import_qualifier: $ => choice(
    $.package_import_wildcard,
    $.package_import_alias
  ),

  package_import_wildcard: $ => '::*',

  package_import_alias: $ => seq(
    'as',
    $.id // package_identifier
  ),

  extend_stmt: $ => choice(
    seq(
      'extend', 'action',
      $.type_identifier,
      '{',
      repeat($.action_body_item),
      '}'
    ),
    seq(
      'extend', 'component',
      $.type_identifier,
      '{',
      repeat($.component_body_item),
      '}'
    ),
    // seq(
    //   'extend', $.struct_kind,
    //   $.type_identifier,
    //   '{',
    //   repeat($.struct_body_item),
    //   '}'
    // ),
    seq(
      'extend', 'enum',
      $.type_identifier,
      '{',
      optseq(
        $.enum_item,
        repseq(',', $.enum_item)
      ),
      '}'
    )
  ),

  // const_field_declaration: $ => seq(
  //   optional('static'), 'const', $.data_declaration
  // ),

  // B.2 Action declarations

  action_declaration: $ => seq(
    'action',
    $.id, // action_identifier
    optional($.template_param_decl_list),
    optional($.action_super_spec),
    '{', repeat($.action_body_item), '}'
  ),

  abstract_action_declaration: $ => seq(
    'abstract', $.action_declaration
  ),

  action_super_spec: $ => seq(':', $.type_identifier),

  action_body_item: $ => choice(
    // $.activity_declaration,
    // $.override_declaration,
    // $.constraint_declaration,
    // $.action_field_declaration,
    // $.symbol_declaration,
    // $.covergroup_declaration,
    // $.exec_block_stmt,
    // $.activity_scheduling_constraint,
    // $.attr_group,
    // $.compile_assert_stmt,
    // $.covergroup_instantiation,
    // $.action_body_compile_if,
    ';' // stmt_terminator
  ),

  // activity_declaration: $ => seq(
  //   'activity', '{', repeat($.activity_stmt), '}'
  // ),

  action_field_declaration: $ => choice(
    // $.attr_field,
    // $.activity_data_field,
    // $.action_handle_declaration,
    $.object_ref_field_declaration
  ),

  object_ref_field_declaration: $ => choice(
    $.flow_ref_field_declaration,
    $.resource_ref_field_declaration
  ),

  flow_ref_field_declaration: $ => seq(
    /(input|output)/,
    $.type_identifier, // flow_object_type,
    $.object_ref_field,
    repseq(',', $.object_ref_field),
    ';'
  ),

  resource_ref_field_declaration: $ => seq(
    /(lock|share)/,
    $.type_identifier, // resource_type_identifier, // resource_object_type,
    $.object_ref_field,
    repseq(',', $.object_ref_field),
    ';'
  ),

  // flow_object_type: $ => choice(
  //   $.buffer_type_identifier,
  //   $.state_type_identifier,
  //   $.stream_type_identifier
  // ),

  // resource_object_type: $ => $.resource_type_identifier,

  object_ref_field: $ => seq(
    $.id, // identifier
    // optional($.array_dim)
  ),


  // action_handle_declaration: $ => seq(
  //   $.type_identifier, // action_type_identifier,
  //   $.action_instantiation,
  //   ';'
  // ),

  // action_instantiation: $ => seq(
  //   $.id, // action_handle_identifier
  //   optional($.array_dim),
  //   repseq(
  //     ',',
  //     $.id, // action_handle_identifier
  //     optional($.array_dim),
  //   )
  // ),

  // activity_data_field: $ => seq('action', $.data_declaration),

  activity_scheduling_constraint: $ => seq(
    'constraint', /(parallel|sequence)/,
    '{',
    $.hierarchical_id,
    ',',
    $.hierarchical_id,
    repseq(',', $.hierarchical_id),
    '}',
    ';'
  ),

  // B.8 Component declarations

  component_declaration: $ => seq(
    optional('pure'),
    'component',
    $.id, // component_identifier
    optional($.template_param_decl_list),
    // optional($.component_super_spec),
    '{', repeat($.component_body_item), '}'
  ),

  component_super_spec: $ => seq(':', $.type_identifier),

  component_body_item: $ => choice(
    // $.override_declaration,
    // $.component_data_declaration,
    $.component_pool_declaration,
    $.action_declaration,
    $.abstract_action_declaration,
    $.object_bind_stmt,
    // $.exec_block,
    // $.struct_declaration,
    // $.enum_declaration,
    // $.covergroup_declaration,
    // $.function_decl,
    // $.import_class_decl,
    // $.procedural_function,
    // $.import_function,
    // $.target_template_function,
    // $.export_action,
    // $.typedef_declaration,
    // $.import_stmt,
    // $.extend_stmt,
    // $.compile_assert_stmt,
    // $.attr_group,
    // $.component_body_compile_if,
    // $.stmt_terminator
  ),

  // component_data_declaration: $ => seq(
  //   optional($.access_modifier),
  //   optseq('static', 'const'),
  //   $.data_declaration
  // ),

  component_pool_declaration: $ => seq(
    'pool',
    optseq('[', $.expression, ']'),
    $.type_identifier,
    $.id, // identifier
    ';'
  ),

  object_bind_stmt: $ => seq(
    'bind',
    $.hierarchical_id,
    $.object_bind_item_or_list,
    ';'
  ),

  object_bind_item_or_list: $ => choice(
    $.object_bind_item_path,
    seq(
      '{',
      $.object_bind_item_path,
      repseq(',', $.object_bind_item_path),
      '}'
    )
  ),

  object_bind_item_path: $ => seq(
    // repseq($.component_path_elem, '.'),
    $.object_bind_item
  ),

  component_path_elem: $ => seq(
    $.id, // component_identifier,
    optseq(
      '[',
      $.expression, // constant_expression
      ']'
    )
  ),

  object_bind_item: $ => choice(
    seq(
      $.type_identifier, // action_type_identifier
      '.',
      $.id, // identifier
      optseq(
        '[',
        $.expression, // constant_expression
        ']'
      )
    ),
    '*'
  ),

  // B.12 Template types (AST)

  template_param_decl_list: $ => seq(
    '<',
    $.template_param_decl,
    repseq(',', $.template_param_decl),
    '>'
  ),

  template_param_decl: $ => choice(
    $.type_param_decl,
    // $.value_param_decl
  ),

  type_param_decl: $ => choice(
    $.generic_type_param_decl,
    // $.category_type_param_decl
  ),

  generic_type_param_decl: $ => seq(
    'type',
    $.id, // identifier
    optseq('=', $.data_type)
  ),

  // category_type_param_decl: $ => seq(
  //   $.type_category,
  //   $.id, // identifier
  //   optional($.type_restriction),
  //   optseq('=', $.type_identifier)
  // ),

  type_restriction: $ => seq(
    ':',
    $.type_identifier
  ),

  // type_category: $ => choice(
  //   'action',
  //   'component',
  //   $.struct_kind
  // ),

  value_param_decl: $ => seq(
    $.data_type,
    $.id, // identifier
    optseq(
      '=',
      $.expression // constant_expression
    )
  ),

  template_param_value_list: $ => seq(
    '<',
    optseq(
      $.template_param_value,
      repseq(',', $.template_param_value)
    ),
    '>'
  ),

  template_param_value: $ => choice(
    // $.expression, // constant_expression
    $.data_type
  ),

  // B.13 Data types

  data_type: $ => choice(
    // $.scalar_data_type,
    // $.collection_type,
    $.reference_type,
    // $.type_identifier
  ),

  scalar_data_type: $ => choice(
    $.chandle_type,
    $.integer_type,
    $.string_type,
    $.bool_type,
    $.enum_type
  ),

  casting_type: $ => choice(
    $.integer_type,
    $.bool_type,
    $.enum_type,
    $.type_identifier
  ),

  chandle_type: $ => 'chandle',

  integer_type: $ => seq(
    $.integer_atom_type,
    optseq(
      '[',
      $.expression, // constant_expression
      optseq(':', '0')
    ),
    optseq('in', '[', $.domain_open_range_list, ']')
  ),

  integer_atom_type: $ => choice('int', 'bit'),

  domain_open_range_list: $ => seq(
    $.domain_open_range_value,
    repseq(',', $.domain_open_range_value)
  ),

  domain_open_range_value: $ => choice(
    seq(
      $.expression, // constant_expression,
      optseq(
        '..',
        $.expression, // constant_expression
      )
    ),
    seq(
      $.expression, // constant_expression
      '..'
    ),
    seq(
      '..',
      $.expression // constant_expression
    )
  ),

  string_type: $ => seq(
    'string',
    optseq('in', '[', $.string_literal, repseq(',', $.string_literal), ']')
  ),

  bool_type: $ => 'bool',

  enum_declaration: $ => seq(
    'enum',
    $.id, // enum_identifier
    optseq(':', $.data_type),
    '{',
    optseq($.enum_item, repseq(',', $.enum_item)),
    '}'
  ),

  enum_item: $ => seq(
    $.id, // identifier
    optseq(
      '=',
      $.expression // constant_expression
    )
  ),

  enum_type: $ => seq(
    $.type_identifier, // enum_type_identifier
    optseq('in', '[', $.domain_open_range_list, ']')
  ),

  float_type: $ => choice('float32', 'float64'),

  collection_type: $ => choice(
    seq(
      'array',
      '<',
      $.data_type,
      ',',
      $.expression, // array_size_expression
      '>'
    ),
    seq('list', '<', $.data_type, '>'),
    seq('map', '<', $.data_type, ',', $.data_type, '>'),
    seq('set', '<', $.data_type, '>')
  ),

  // array_size_expression: $ => $.constant_expression,

  reference_type: $ =>seq(
    'ref',
    $.id // entity_type_identifier
  ),

  typedef_declaration: $ => seq(
    'typedef',
    $.data_type,
    $.type_identifier,
    ';'
  ),

  // B.17 Expressions

  // constant_expression: $ => $.expression,

  expression: $ => choice(
    $.primary,
    seq($.unary_operator, $.primary),
    prec.left(seq($.expression, $.binary_operator, $.expression)),
    $.conditional_expression,
    // $.in_expression
  ),

  unary_operator: $ => choice('-', '~', '&', '|', '^'),

  binary_operator: $ => choice(
    '*', '/', '%', '+', '-', '<<', '>>',
    '==', '!=', '<', '<=', '>', '>=',
    '||', '&&', '|', '^', '&', '**'
  ),

  assign_op: $ => choice('=', '+=', '-=', '<<=', '>>=', '|=', '&='),

  conditional_expression: $ => prec.left(seq(
    $.expression, // cond_predicate
    '?',
    $.expression,
    ':',
    $.expression
  )),

  in_expression: $ => choice(
    seq($.expression, 'in', '[', $.open_range_list, ']'),
    seq(
      $.expression,
      'in',
      $.expression // collection_expression
    )
  ),

  open_range_list: $ => seq(
    $.open_range_value, repseq(',', $.open_range_value)
  ),

  open_range_value: $ => seq(
    $.open_range_value,
    optseq('..', $.open_range_value)
  ),

  // collection_expression: $ => $.expression,

  primary: $ => choice(
    $.number,
    // $.ref_path,
    $.aggregate_literal,
    $.bool_literal,
    $.string_literal,
    $.null_ref,
    $.paren_expr,
    // $.cast_expression,
    // $.compile_has_expr
  ),

  paren_expr: $ => seq('(', $.expression, ')'),

  cast_expression: $ => seq(
    '(',
    $.casting_type,
    ')',
    $.expression
  ),

  ref_path: $ => choice(
    seq(
      $.static_ref_path,
      optseq('.', $.hierarchical_id),
      optional($.bit_slice)
    ),
    seq(
      optseq('super', '.'),
      $.hierarchical_id,
      optional($.bit_slice)
    )
  ),

  static_ref_path: $ => seq(
    optional('::'),
    repseq($.type_identifier_elem, '::'),
    $.member_path_elem
  ),

  bit_slice: $ => seq(
    '[',
    $.expression, // constant_expression
    ':',
    $.expression, // constant_expression
    ']'
  ),

  function_call: $ => choice(
    seq('super', '.', $.function_ref_path),
    seq(
      optional('::'),
      repseq($.type_identifier_elem, '::'),
      $.function_ref_path
    )
  ),

  function_ref_path: $ => seq(
    repseq($.member_path_elem, '.'),
    $.id, // identifier
    $.function_parameter_list
  ),

  symbol_call: $ => seq(
    $.id, // symbol_identifier
    $.function_parameter_list,
    ';'
  ),

  function_parameter_list: $ => seq(
    '(', optseq(
      $.expression,
      repseq(',', $.expression),
    ), ')'
  ),

  // B.18 Identifiers

  id: $ => /[a-zA-Z_]\w*/,

  hierarchical_id_list: $ => seq(
    $.hierarchical_id,
    repseq(',', $.hierarchical_id)
  ),

  hierarchical_id: $ => seq(
    $.member_path_elem,
    repseq('.', $.member_path_elem)
  ),

  member_path_elem: $ => seq(
    $.id, // identifier
    optional($.function_parameter_list),
    repseq('[', $.expression, ']')
  ),

  type_identifier: $ => seq(
    optional('::'),
    $.type_identifier_elem,
    repseq('::', $.type_identifier_elem)
  ),

  type_identifier_elem: $ => seq(
    $.id, // identifier
    optional($.template_param_value_list)
  ),

  // B.19 Numbers and literals

  number: $ => choice(
    $.integer_number,
    $.floating_point_number
  ),

  integer_number: $ => token(choice(
    /0[bB][01][01_]*/,  // bin_number
    /0[0-7_]*/,         // oct_number
    /[1-9][0-9]*/,      // dec_number
    /0[xX][0-9a-fA-F][0-9a-fA-F_]*/, // hex_number
    /([1-9][0-9]*)?'([sS]b)|(B)[01][01_]*/, // based_bin_number
    /([1-9][0-9]*)?'([sS]o)|(O)[01][01_]*/, // based_oct_number
    /([1-9][0-9]*)?'([sS]d)|(D)[01][01_]*/, // based_dec_number
    /([1-9][0-9]*)?'([sS]h)|(H)[01][01_]*/  // based_hex_number
  )),

  floating_point_number: $ => token(choice(
    /[0-9][0-9_]*[.][0-9][0-9_]*/, // floating_point_dec_number
    /[0-9][0-9_]*([.][0-9][0-9_]*)?[eE][+-]?[0-9][0-9_]*/ // floating_point_sci_number
  )),

  aggregate_literal: $ => choice(
    $.empty_aggregate_literal,
    $.value_list_literal,
    $.map_literal,
    $.struct_literal
  ),

  empty_aggregate_literal: $ => seq('{', '}'),

  value_list_literal: $ => seq(
    '{', $.expression, repseq(',', $.expression), '}'
  ),

  map_literal: $ => seq(
    '{', $.map_literal_item, repseq(',', $.map_literal_item), '}'
  ),

  map_literal_item: $ => seq(
    $.expression, ':', $.expression
  ),

  struct_literal: $ => seq(
    '{', $.struct_literal_item, repseq(',', $.struct_literal_item), '}'
  ),

  struct_literal_item: $ => seq(
    '.',
    $.id, // identifier
    '=',
    $.expression
  ),

  bool_literal: $ => token(choice('true', 'false')),

  null_ref: $ => token('null'),

  // B.20 Additional lexical conventions

  comment: $ => token(choice(
    seq('//', /.*/),
    seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    )
  )),

  string_literal: $ => choice(
    $.QUOTED_STRING,
    // $.TRIPLE_QUOTED_STRING
  ),

  QUOTED_STRING: $ => seq(
    '"',
    repeat(choice(
      token.immediate(/[^\\"]+/),
      token.immediate(seq('\\', /./))
    )),
    '"'
  ),

  // TRIPLE_QUOTED_STRING: $ =>

};

module.exports = grammar({
  name: 'pss',
  word: $ => $.id,
  rules: rules,
  extras: $ => [
    /\s|\\\r?\n/,
    $.comment
    // $.template
  ]
});

/* eslint camelcase: 0 */
/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
