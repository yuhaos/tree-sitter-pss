'use strict';

function optseq() {
  return optional(prec.left(seq.apply(null, arguments)));
}

function repseq() {
  return optional(repeat(prec.left(seq.apply(null, arguments))));
}

function sep1(separator, rule) {
  return prec.left(seq(
    rule,
    repeat(prec.left(seq(separator, rule)))
  ));
}

const rules = {

  // PSS 3.0
  // Annex B

  source_file: $ => repeat($.portable_stimulus_description),

  portable_stimulus_description: $ => choice(
    $.package_declaration, // Already included */
    $.component_declaration, // Already included */
    $.package_body_item
  ),

  // B.1 Package declarations

  package_declaration: $ => prec(2, seq(
    'package', $.package_id_path,
    '{', repeat($.package_body_item), '}'
  )),

  package_id_path: $ => seq(
    $.id, // package_identifier
    optseq(
      '::',
      $.id // package_identifier
    )
  ),

  package_body_item: $ => choice(
    $.abstract_action_declaration,
    $.abstract_monitor_declaration, // 3.0
    $.struct_declaration,
    $.enum_declaration,
    $.covergroup_declaration,
    $.function_decl,
    $.import_class_decl,
    $.procedural_function_task,
    $.import_function,
    $.target_template_function_task,
    $.export_action,
    $.typedef_declaration,
    $.import_stmt,
    $.extend_stmt,
    $.const_field_declaration,
    $.component_declaration,
    $.package_declaration,
    $.compile_assert_stmt,
    $.package_body_compile_if,
    $.SNPS_SHADOWED,
    ';' // stmt_terminator
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
    'as', $.id // package_identifier
  ),

  extend_stmt: $ => choice(
    seq('extend', 'action',       $.type_identifier, '{', repeat($.action_body_item),                     '}'),
    seq('extend', 'component',    $.type_identifier, '{', repeat($.component_body_item),                  '}'),
    seq('extend', $.struct_kind,  $.type_identifier, '{', repeat($.struct_body_item),                     '}'),
    seq('extend', 'enum',         $.type_identifier, '{', optseq($.enum_item, repseq(',', $.enum_item)),  '}')
  ),

  const_field_declaration: $ => seq(
    optional('static'), 'const', $.data_declaration
  ),

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
    $.activity_declaration,
    $.override_declaration,
    $.constraint_declaration,
    $.action_field_declaration,
    $.symbol_declaration,
    $.covergroup_declaration,
    $.exec_block_stmt,
    $.activity_scheduling_constraint,
    $.attr_group,
    $.compile_assert_stmt,
    $.covergroup_instantiation,
    $.action_body_compile_if,
    $.SNPS_SHADOWED,
    ';' // stmt_terminator
  ),

  activity_declaration: $ => seq(
    'activity', '{', repeat($.activity_stmt), '}'
  ),

  action_field_declaration: $ => choice(
    $.attr_field,
    $.activity_data_field,
    $.action_handle_declaration,
    $.object_ref_field_declaration
  ),

  object_ref_field_declaration: $ => choice(
    $.flow_ref_field_declaration,
    $.resource_ref_field_declaration
  ),

  flow_ref_field_declaration: $ => seq(
    $.function_parameter_dir,
    $.type_identifier, // flow_object_type,
    $.object_ref_field,
    repseq(',', $.object_ref_field),
    ';'
  ),

  resource_ref_field_declaration: $ => seq(
    $.resource_ref_field_type,
    $.type_identifier, // resource_type_identifier, // resource_object_type,
    $.object_ref_field,
    repseq(',', $.object_ref_field),
    ';'
  ),

  resource_ref_field_type: $=> choice(
    "lock",
    "share"
  ),

  // confirmed: these xx_type_identifier are all set to type_identifier at last
  /*
  flow_object_type: $ => choice(
    $.buffer_type_identifier,
    $.state_type_identifier,
    $.stream_type_identifier
  ),
  */

  /*
  resource_object_type: $ => $.resource_type_identifier,
  */

  object_ref_field: $ => seq(
    $.id, // identifier
    optional($.array_dim)
  ),


  action_handle_declaration: $ => seq(
    $.type_identifier, // action_type_identifier,
    $.action_instantiation,
    ';'
  ),

  action_instantiation: $ => seq(
    $.id, // action_handle_identifier
    optional($.array_dim),
    repseq(
      ',',
      $.id, // action_handle_identifier
      optional($.array_dim)
    )
  ),

  activity_data_field: $ => seq('action', $.data_declaration),

  activity_scheduling_constraint: $ => seq(
    'constraint', choice('parallel', 'sequence'),
    '{', $.hierarchical_id, ',', $.hierarchical_id, repseq(',', $.hierarchical_id), '}',
    ';'
  ),

  // B.3 Struct declarations

  struct_declaration: $ => seq(
    $.struct_kind,
    $.id, // identifier
    optional($.template_param_decl_list),
    optional($.struct_super_spec),
    '{', repeat($.struct_body_item), '}'
  ),

  struct_kind: $ => choice(
    'struct',
    $.object_kind
  ),

  object_kind: $ => choice(
    'buffer',
    'stream',
    'state',
    'resource'
  ),

  struct_super_spec: $ => seq(':', $.type_identifier),

  struct_body_item: $ => choice(
    $.constraint_declaration,
    $.data_declaration,
    $.attr_field,
    $.typedef_declaration,
    $.exec_block_stmt,
    $.attr_group,
    $.compile_assert_stmt,
    $.covergroup_declaration,
    $.covergroup_instantiation,
    $.struct_body_compile_if,
    $.SNPS_SHADOWED,
    ';'
  ),

  // B.4 Exec blocks

  exec_block_stmt: $ => choice(
    $.exec_block,
    $.target_code_exec_block,
    $.target_file_exec_block,
    ';'
  ),

  exec_block: $ => seq('exec', $.exec_kind, '{', repeat($.exec_stmt), '}'),

  exec_kind: $ => token(choice(
    'pre_solve',
    'post_solve',
    'pre_body',
    'body',
    'header',
    'declaration',
    'run_start',
    'run_end',
    'init_up',
    'init_down',
    'init'
  )),

  exec_stmt: $ => choice(
    $.procedural_stmt,
    $.exec_super_stmt
  ),

  exec_super_stmt: $ => seq('super', ';'),

  target_code_exec_block: $ => seq(
    'exec',
    $.exec_kind,
    $.id, // language_identifier
    '=',
    $.string_literal,
    ';'
  ),

  target_file_exec_block: $ => seq(
    'exec', 'file',
    $.QUOTED_STRING, // filename_string
    '=', $.string_literal, ';'
  ),

  // B.5 Functions
  procedural_function_task: $ => seq(
    optional(seq('(', '*', 'task', '*', ')')),
    $.procedural_function
  ),

  procedural_function: $ => seq(
    optional($.platform_qualifier),
    optional('pure'),
    optional('static'),
    'function',
    $.function_prototype,
    '{',
    repeat($.procedural_stmt),
    '}'
  ),

  function_decl: $ => seq(
    optional(seq('(', '*', 'task', '*', ')')),
    optional($.platform_qualifier),
    optional('pure'),
    optional('static'),
    'function',
    $.function_prototype,
    ';'
  ),

  platform_qualifier: $ => choice('target', 'solve'),

  function_prototype: $ => seq(
    $.function_return_type,
    $.id, // function_identifier,
    $.function_parameter_list_prototype
  ),

  function_return_type: $ => choice(
    'void',
    $.data_type
  ),

  function_parameter_list_prototype: $ => choice(
    seq('(', optseq($.function_parameter, repseq(',', $.function_parameter)), ')')
    // TODO: this line could cause issues in function parameter if more than one parameter exist
    // comment it currently
    // seq('(', repseq($.function_parameter, ','), $.varargs_parameter, ')')
  ),

  function_parameter: $ => choice(
    seq(
      optional($.function_parameter_dir),
      $.data_type,
      $.id, // identifier
      optseq(
        '=',
        $.expression // constant_expression
      )
    ),
    seq(
      choice('type', seq('ref', $.type_category), 'struct'),
      $.id // identifier
    )
  ),

  function_parameter_dir: $ => choice('input', 'output', 'inout'),

  varargs_parameter: $ => seq(
    choice($.data_type, 'type', seq('ref', $.type_category), 'struct'),
    '...',
    $.id // identifier
  ),

  // B.6 Foreign procedural interface

  import_function: $ => choice(
    seq(
      'import',
      optional($.platform_qualifier),
      optional(
        $.id // language_identifier
      ),
      'function',
      $.type_identifier,
      ';'
    ),
    seq(
      'import',
      optional($.platform_qualifier),
      optional(
        $.id // language_identifier
      ),
      optional('static'),
      'function',
      $.function_prototype,
      ';'
    )
  ),

  target_template_function_task: $ => seq(
    optional(seq('(', '*', 'task', '*', ')')),
    $.target_template_function
  ),

  target_template_function: $ => seq(
    'target',
    $.id, // language_identifier,
    optional('static'),
    'function',
    $.function_prototype,
    '=',
    $.string_literal,
    ';'
  ),

  import_class_decl: $ => seq(
    'import', 'class', $.id, // import_class_identifier,
    optional($.import_class_extends),
    '{',
    repeat($.import_class_function_decl),
    '}'
  ),

  import_class_extends: $ => seq(
    ':', $.type_identifier, repseq(',', $.type_identifier)
  ),

  import_class_function_decl: $ => seq($.function_prototype, ';'),

  export_action: $ => seq(
    'export',
    optional($.platform_qualifier),
    $.type_identifier, // action_type_identifier
    $.function_parameter_list_prototype,
    ';'
  ),

  // B.7 Procedural statements

  procedural_stmt: $ => choice(
    $.procedural_sequence_block_stmt,
    $.procedural_data_declaration,
    $.procedural_assignment_stmt,
    $.procedural_void_function_call_stmt,
    $.procedural_return_stmt,
    $.procedural_repeat_stmt,
    $.procedural_foreach_stmt,
    $.procedural_if_else_stmt,
    $.procedural_match_stmt,
    $.procedural_break_stmt,
    $.procedural_continue_stmt,
    $.procedural_randomization_stmt,
    $.procedural_compile_if,
    $.procedural_yield_stmt, // 3.0
    ';'
  ),

  procedural_sequence_block_stmt: $ => seq(
    optional('sequence'),
    '{', repeat($.procedural_stmt), '}'
  ),

  procedural_data_declaration: $ => seq(
    $.data_type,
    $.procedural_data_instantiation,
    repseq(',', $.procedural_data_instantiation),
    ';'
  ),

  procedural_data_instantiation: $ => seq(
    $.id, // identifier
    optional($.array_dim),
    optseq(
      '=',
      $.expression
    )
  ),

  procedural_assignment_stmt: $ => seq(
    $.ref_path,
    $.assign_op,
    $.expression,
    ';'
  ),

  procedural_void_function_call_stmt: $ => seq(
    optseq('(', 'void', ')'),
    $.function_call,
    ';'
  ),

  procedural_return_stmt: $ => seq(
    'return', optional($.expression), ';'
  ),

  procedural_repeat_stmt: $ => choice(
    seq(
      choice('repeat', 'replicate'), '(', optseq(
        $.id, // identifier
        ':'
      ),
      $.expression,
      ')', $.procedural_stmt
    ),
    seq(
      'repeat', $.procedural_stmt, 'while', '(', $.expression, ')', ';'
    ),
    seq(
      'while', '(', $.expression, ')', $.procedural_stmt
    )
  ),

  procedural_foreach_stmt: $ => seq(
    'foreach', '(',
    optseq(
      $.id, // iterator_identifier
      ':'
    ),
    $.expression,
    optseq(
      '[',
      $.id, // index_identifier
      ']'
    ),
    ')',
    $.procedural_stmt
  ),

  // Unresolved conflict for symbol sequence:
  // 'function'  function_prototype  '{'  'if'  '('  expression  ')'  'if'  '('  expression  ')'  procedural_stmt  •  'else'  …

  // Possible interpretations:
  // 1:  'function'  function_prototype  '{'  'if'  '('  expression  ')'  (procedural_if_else_stmt  'if'  '('  expression  ')'  procedural_stmt  •  'else'  procedural_stmt)
  // 2:  'function'  function_prototype  '{'  'if'  '('  expression  ')'  (procedural_if_else_stmt  'if'  '('  expression  ')'  procedural_stmt)  •  'else'  …

  // Possible resolutions:
  // 1:  Specify a left or right associativity in `procedural_if_else_stmt`
  // 2:  Add a conflict for these rules: `procedural_if_else_stmt`
  procedural_if_else_stmt: $ => // prec.left(2,
    seq(
      'if', '(', $.expression, ')', $.procedural_stmt,
      optseq('else', $.procedural_stmt)
    // )
  ),

  procedural_match_stmt: $ => seq(
    'match', '(',
    $.expression, // match_expression
    ')',
    '{',
    $.procedural_match_choice,
    repeat($.procedural_match_choice),
    '}'
  ),

  procedural_match_choice: $ => choice(
    seq('[', $.open_range_list, ']', ':', $.procedural_stmt),
    seq('default', ':', $.procedural_stmt)
  ),

  procedural_break_stmt: $ => seq('break', ';'),

  procedural_continue_stmt: $ => seq('continue', ';'),

  procedural_randomization_stmt: $ => seq(
    'randomize',
    $.procedural_randomization_target,
    $.procedural_randomization_term
  ),

  procedural_randomization_target: $ => seq(
    $.hierarchical_id, repseq(',', $.hierarchical_id)
  ),

  procedural_randomization_term: $ => ';',

  procedural_yield_stmt: $ => seq('yield', ';'), // 3.0

  // B.8 Component declarations

  component_declaration: $ => seq(
    optional('pure'),
    'component',
    $.id, // component_identifier
    optional($.template_param_decl_list),
    optional($.component_super_spec),
    '{', repeat($.component_body_item), '}'
  ),

  component_super_spec: $ => seq(':', $.type_identifier),

  component_body_item: $ => choice(
    $.override_declaration,
    $.component_data_declaration,
    $.component_pool_declaration,
    $.action_declaration,
    $.abstract_action_declaration,
    $.object_bind_stmt,
    $.exec_block_stmt,
    $.struct_declaration,
    $.enum_declaration,
    $.covergroup_declaration,
    $.function_decl,
    $.import_class_decl,
    $.procedural_function_task,
    $.import_function,
    $.target_template_function_task,
    $.export_action,
    $.typedef_declaration,
    $.import_stmt,
    $.extend_stmt,
    $.compile_assert_stmt,
    $.attr_group,
    $.component_body_compile_if,
    $.SNPS_SHADOWED,
    ';' // stmt_terminator
  ),

  component_data_declaration: $ => seq(
    optional($.access_modifier),
    optseq('static', 'const'),
    $.data_declaration
  ),

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
    repseq($.component_path_elem, '.'),
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

  // B.9 Activity statements

  activity_stmt: $ => choice(
    seq(
      optseq(
        $.id, // label_identifier
        ':'
      ),
      $.labeled_activity_stmt
    ),
    $.activity_action_traversal_stmt,
    $.activity_data_field,
    $.activity_bind_stmt,
    $.action_handle_declaration,
    $.activity_constraint_stmt,
    $.activity_scheduling_constraint,
    ';' // stmt_terminator
  ),

  labeled_activity_stmt: $ => choice(
    $.activity_sequence_block_stmt,
    $.activity_parallel_stmt,
    $.activity_schedule_stmt,
    $.activity_repeat_stmt,
    $.activity_foreach_stmt,
    $.activity_select_stmt,
    $.activity_if_else_stmt,
    $.activity_match_stmt,
    $.activity_replicate_stmt,
    $.activity_super_stmt,
    $.activity_atomic_block_stmt,
    $.symbol_call
  ),

  activity_action_traversal_stmt: $ => choice(
    seq(
      $.id, // identifier
      optseq('[', $.expression, ']'), $.inline_constraints_or_empty
    ),
    seq(
      optseq('[',
        $.id, // label_identifier
        ':'
      ),
      'do',
      $.type_identifier,
      $.inline_constraints_or_empty
    )
  ),

  // inline_constraints_or_empty: $ => ';',

  activity_sequence_block_stmt: $ => seq(
    optional('sequence'), '{', repeat($.activity_stmt), '}'
  ),

  activity_parallel_stmt: $ => seq(
    'parallel', optional($.activity_join_spec), '{', repeat($.activity_stmt), '}'
  ),

  activity_schedule_stmt: $ => seq(
    'schedule', optional($.activity_join_spec), '{', repeat($.activity_stmt), '}'
  ),

  activity_join_spec: $ => choice(
    $.activity_join_branch,
    $.activity_join_select,
    $.activity_join_none,
    $.activity_join_first
  ),

  activity_join_branch: $ => seq(
    'join_branch', '(',
    $.id, // label_identifier
    repseq(
      ',',
      $.id // label_identifier
    ),
    ')'
  ),

  activity_join_select: $ => seq('join_select', '(', $.expression, ')'),

  activity_join_none: $ => 'join_none',

  activity_join_first: $ =>seq('join_first', '(', $.expression, ')'),

  activity_repeat_stmt: $ => choice(
    seq(
      'repeat', '(',
      optseq(
        $.id, // index_identifier
        ':'
      ),
      $.expression, ')', $.activity_stmt
    ),
    seq('repeat', $.activity_stmt, 'while', '(', $.expression, ')', ';')
  ),

  activity_foreach_stmt: $ => seq(
    'foreach', '(',
    repseq(
      $.id, // iterator_identifier
      ':'
    ),
    $.expression,
    optseq(
      '[',
      $.id, // index_identifier
      ']'
    ),
    ')',
    $.activity_stmt
  ),

  activity_select_stmt: $ => seq(
    'select',
    '{',
    $.select_branch,
    $.select_branch,
    repeat($.select_branch),
    '}'
  ),

  select_branch: $ => seq(
    optseq(
      optseq('(', $.expression, ')'),
      optseq('[', $.expression, ']'),
      ':'
    ),
    $.activity_stmt
  ),

  activity_if_else_stmt: $ => prec.left(seq(
    'if', '(', $.expression, ')', $.activity_stmt, optseq('else', $.activity_stmt)
  )),

  activity_match_stmt: $ => seq(
    'match', '(',
    $.expression, // match_expression
    ')',
    '{', $.match_choice, repeat($.match_choice), '}'
  ),

  // match_expression: $ => expression

  match_choice: $ => choice(
    seq('[', $.open_range_list, ']', ':', $.activity_stmt),
    seq('default', ':', $.activity_stmt)
  ),

  activity_replicate_stmt: $ => seq(
    'replicate',
    '(',
    optseq(
      $.id, // index_identifier
      ':'
    ),
    $.expression,
    ')',
    optseq(
      $.id, // label_identifier
      '[', ']', ':'
    ),
    $.labeled_activity_stmt
  ),

  activity_super_stmt: $ => seq('super', ';'),

  activity_atomic_block_stmt: $ => seq(
    'atomic', '{', repeat($.activity_stmt), '}'
  ),

  activity_bind_stmt: $ => seq(
    'bind', $.hierarchical_id, $.activity_bind_item_or_list, ';'
  ),

  activity_bind_item_or_list: $ => choice(
    $.hierarchical_id,
    seq('{', $.hierarchical_id_list, '}')
  ),

  activity_constraint_stmt: $ => seq("constraint", $.constraint_set),

  symbol_declaration: $ => seq(
    'symbol',
    $.id, // symbol_identifier
    optseq(
      '(',
      optseq($.symbol_param, repseq(',', $.symbol_param)), // symbol_paramlist
      ')'
    ),
    '{', repeat($.activity_stmt), '}'
  ),

  // symbol_paramlist: $ => [ symbol_param { , symbol_param } ]

  symbol_param: $ => seq(
    $.data_type,
    $.id // identifier
  ),

  // B.10 Overrides

  override_declaration: $ => seq(
    'override', '{', repeat($.override_stmt), '}'
  ),

  override_stmt: $ => choice(
    $.type_override,
    $.instance_override,
    $.override_compile_if,
    ';' // stmt_terminator
  ),

  type_override: $ => seq(
    'type', $.type_identifier, 'with', $.type_identifier, ';'
  ),

  instance_override: $ => seq(
    'instance', $.hierarchical_id, 'with', $.type_identifier, ';'
  ),

  // B.11 Data coverage specification

  data_declaration: $ => seq(
    $.data_type,
    $.data_instantiation,
    repseq(',', $.data_instantiation),
    ';'
  ),

  data_instantiation: $ => seq(
    $.id, // identifier
    optional($.array_dim),
    optseq(
      '=',
      $.expression // constant_expression
    )
  ),

  array_dim: $ => seq(
    '[',
    $.expression, // constant_expression
    ']'
  ),

  attr_field: $ => seq(
    optional($.access_modifier),
    choice(
      'rand',
      seq('static', 'const')
    ),
    $.data_declaration
  ),

  access_modifier: $ => choice('public', 'protected', 'private'),

  attr_group: $ => seq($.access_modifier, ':'),

  // B.12 Behavioral coverage specification

  cover_stmt: $ => choice(
    seq(
      optseq(
        $.id, // label_identifier
        ':'
      ),
      'cover', $.type_identifier, ';'
    ),
    seq(
      optseq(
        $.id, // label_identifier
        ':'
      ),
      'cover', '{', repeat($.monitor_body_item), '}'
    )
  ),

  monitor_declaration: $ => seq(
    'monitor',
    $.id, // monitor_identifier
    optional($.template_param_decl_list),
    optional($.monitor_super_spec),
    '{',
    repeat($.monitor_body_item),
    '}'
  ),

  abstract_monitor_declaration: $ => seq('abstract', $.monitor_declaration),

  monitor_super_spec: $ => seq(':', $.type_identifier),

  monitor_body_item: $ => choice(
    $.monitor_activity_declaration,
    $.override_declaration,
    $.monitor_constraint_declaration,
    $.monitor_field_declaration,
    $.covergroup_declaration,
    $.attr_group,
    $.compile_assert_stmt,
    $.covergroup_instantiation,
    $.monitor_body_compile_if,
    $.SNPS_SHADOWED,
    ';' // stmt_terminator
  ),

  monitor_field_declaration: $ => choice(
    $.const_field_declaration,
    $.action_handle_declaration,
    $.monitor_handle_declaration
  ),

  monitor_activity_declaration: $ => seq(
    'activity', '{', repeat($.monitor_activity_stmt), '}'
  ),

  monitor_activity_stmt: $ => choice(
    seq(
      optseq(
        $.id, // label_identifier
        ':'
      ),
      $.labeled_monitor_activity_stmt
    ),
    $.activity_action_traversal_stmt,
    $.monitor_activity_monitor_traversal_stmt,
    $.action_handle_declaration,
    $.monitor_handle_declaration,
    $.monitor_activity_constraint_stmt,
    ';' // stmt_terminator
  ),

  labeled_monitor_activity_stmt: $ => choice(
    $.monitor_activity_sequence_block_stmt,
    $.monitor_activity_concat_stmt,
    $.monitor_activity_eventually_stmt,
    $.monitor_activity_overlap_stmt,
    $.monitor_activity_schedule_stmt
  ),

  // already defined before
  // activity_action_traversal_stmt: $ => choice(
  //   seq(
  //     $.id, // identifier
  //     optseq('[', $.expression, ']'),
  //     $.inline_constraints_or_empty
  //   ),
  //   seq(
  //     optseq(
  //       $.id, // label_identifier
  //       ':'
  //     ),
  //     'do',
  //     $.type_identifier,
  //     $.inline_constraints_or_empty
  //   )
  // ),

  inline_constraints_or_empty: $ => choice(
    seq('with', $.constraint_set),
    ';'
  ),

  monitor_handle_declaration: $ => seq(
    $.type_identifier, // monitor_type_identifier
    $.monitor_instantiation,
    ';'
  ),

  monitor_instantiation: $ => seq(
    $.id, // monitor_identifier
    optional($.array_dim),
    repseq(
      ',',
      $.id, // monitor_identifier
      optional($.array_dim)
    )
  ),

  monitor_activity_sequence_block_stmt: $ => seq(
    optional('sequence'), '{', repeat($.monitor_activity_stmt), '}'
  ),

  monitor_activity_concat_stmt: $ => seq(
    'concat', '{', repeat($.monitor_activity_stmt), '}'
  ),

  monitor_activity_eventually_stmt: $ => seq(
    'eventually', $.monitor_activity_stmt, ';'
  ),

  monitor_activity_overlap_stmt: $ => seq(
    'overlap', '{', repeat($.monitor_activity_stmt), '}'
  ),

  monitor_activity_select_stmt: $ => seq(
    'select', '{',
    $.monitor_activity_stmt,
    $.monitor_activity_stmt,
    repeat($.monitor_activity_stmt),
    '}'
  ),

  monitor_activity_schedule_stmt: $ => seq(
    'schedule', '{', repeat($.monitor_activity_stmt), '}'
  ),

  monitor_activity_monitor_traversal_stmt: $ => choice(
    seq(
      $.id, // monitor_identifier
      optseq('[', $.expression, ']'),
      $.inline_constraints_or_empty
    ),
    seq(
      optseq(
        $.id, // label_identifier
        ':'
      ),
      'do',
      $.type_identifier, // monitor_type_identifier
      $.inline_constraints_or_empty
    )
  ),

  monitor_inline_constraints_or_empty: $ => choice(
    seq('with', $.monitor_constraint_set),
    ';'
  ),

  monitor_activity_constraint_stmt: $ => seq(
    'constraint', $.monitor_constraint_set
  ),

  monitor_constraint_declaration: $ => choice(
    seq('constraint', $.monitor_constraint_set),
    seq('constraint',
      $.id, // identifier
      $.monitor_constraint_block
    )
  ),

  monitor_constraint_set: $ => choice(
    $.monitor_constraint_body_item,
    $.monitor_constraint_block
  ),

  monitor_constraint_block: $ => seq(
    '{', repeat($.monitor_constraint_body_item), '}'
  ),

  monitor_constraint_body_item: $ => choice(
    $.expression_constraint_item,
    $.foreach_constraint_item,
    $.forall_constraint_item,
    $.if_constraint_item,
    $.implication_constraint_item,
    $.unique_constraint_item,
    // $.constraint_compile_if, // this is not define now
    ';' // stmt_terminator
  ),

  // B.13 Template types

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
    $.category_type_param_decl
  ),

  generic_type_param_decl: $ => seq(
    'type',
    $.id, // identifier
    optseq('=', $.data_type)
  ),

  category_type_param_decl: $ => seq(
    $.type_category,
    $.id, // identifier
    optional($.type_restriction),
    optseq('=', $.type_identifier)
  ),

  type_restriction: $ => seq(
    ':',
    $.type_identifier
  ),

  type_category: $ => choice(
    'action',
    'component',
    $.struct_kind
  ),

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

  template_param_value: $ => prec.left(1,choice(
    $.expression, // constant_expression
    $.data_type
  )),

  // B.14 Data types

  data_type: $ => choice(
    $.scalar_data_type,
    $.collection_type,
    $.reference_type,
    $.type_identifier
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

  integer_type: $ => prec.left(1, seq(
    $.integer_atom_type,
    optseq(
      '[',
      $.expression, // constant_expression
      optseq(':', '0'),
      ']'
    ),
    optseq('in', '[', $.domain_open_range_list, ']')
  )),

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
        $.expression // constant_expression
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

  // B.15 Constraints

  constraint_declaration: $ => choice(
    seq('constraint', optional('soft'), $.constraint_set),
    seq(
      optional('dynamic'),
      'constraint',
      optional('soft'),
      $.id, // identifier
      $.constraint_block
    )
  ),

  constraint_set: $ => choice(
    $.constraint_body_item,
    $.constraint_block
  ),

  constraint_block: $ => seq(
    '{', repeat(seq(optional('soft'), $.constraint_body_item)), '}'
  ),

  constraint_body_item: $ => choice(
    $.expression_constraint_item,
    $.foreach_constraint_item,
    $.forall_constraint_item,
    $.if_constraint_item,
    $.implication_constraint_item,
    $.unique_constraint_item,
    seq('default', $.hierarchical_id, '==', $.expression, // constant_expression
      ';'
    ),
    seq('default', 'disable', $.hierarchical_id, ';'),
    $.dist_directive,
    $.constraint_body_compile_if,
    $.SNPS_SHADOWED,
    ';' // stmt_terminator
  ),

  expression_constraint_item: $ => seq($.expression, ';'),

  foreach_constraint_item: $ => seq(
    'foreach', '(',
    optseq(
      $.id, // iterator_identifier,
      ':'
    ),
    $.expression,
    optseq(
      '[',
      $.id, // index_identifier
      ']'
    ),
    ')',
    $.constraint_set
  ),

  forall_constraint_item: $ => seq(
    'forall', '(',
    $.id, // iterator_identifier
    ':',
    $.type_identifier,
    optseq('in', $.ref_path),
    ')',
    $.constraint_set
  ),

  if_constraint_item: $ => prec.left(seq(
    'if', '(', $.expression, ')', $.constraint_set, optseq('else', $.constraint_set)
  )),

  implication_constraint_item: $ => seq($.expression, '->', $.constraint_set),

  unique_constraint_item: $ => seq('unique', '{', $.hierarchical_id_list, '}', ';'),

  dist_directive: $ => seq('dist', $.expression, 'in', '[', $.dist_list, ']', ';'),

  dist_list: $ => seq($.dist_item, repseq(',', $.dist_item)),

  dist_item: $ => prec.left(1, seq($.open_range_value, optional($.dist_weight))),

  dist_weight: $ => choice(
    seq(':=', $.expression),
    seq(':/', $.expression)
  ),

  // B.16 Coverage specification

  covergroup_declaration: $ => seq(
    'covergroup', $.id, // covergroup_identifier
    '(', $.covergroup_port, repseq(',', $.covergroup_port), ')',
    '{', repeat($.covergroup_body_item), '}'
  ),

  covergroup_port: $ => seq(
    $.data_type, $.id // identifier
  ),

  covergroup_body_item: $ => choice(
    $.covergroup_option,
    $.covergroup_coverpoint,
    $.covergroup_cross,
    $.covergroup_body_compile_if,
    $.SNPS_SHADOWED,
    ';' // stmt_terminator
  ),

  covergroup_option: $ => seq(
    'option', '.', $.id, // identifier
    '=', $.expression, // constant_expression
    ';'
  ),

  covergroup_instantiation: $ => choice(
    $.covergroup_type_instantiation,
    $.inline_covergroup
  ),

  inline_covergroup: $ => seq(
    'covergroup', '{',
    repeat($.covergroup_body_item),
    '}',
    $.id, // identifier
    ';'
  ),

  covergroup_type_instantiation: $ => seq(
    $.id, // covergroup_type_identifier
    $.id, // covergroup_identifier
    '(', $.covergroup_portmap_list, ')',
    $.covergroup_options_or_empty
  ),

  covergroup_portmap_list: $ => choice(
    seq($.covergroup_portmap, repseq(',', $.covergroup_portmap)),
    $.hierarchical_id_list
  ),

  covergroup_portmap: $ => seq(
    '.',
    $.id, // identifier
    '(', $.hierarchical_id, ')'
  ),

  covergroup_options_or_empty: $ => choice(
    seq('with', '{', repeat($.covergroup_option), '}'),
    ';'
  ),

  covergroup_coverpoint: $ => seq(
    optseq(
      optional($.data_type),
      $.id, // coverpoint_identifier
      ':'
    ),
    'coverpoint',
    $.expression,
    optseq('iff', '(', $.expression, ')'),
    $.bins_or_empty
  ),

  bins_or_empty: $ => choice(
    seq('{', $.covergroup_coverpoint_body_item, '}'),
    ';'
  ),

  covergroup_coverpoint_body_item: $ => choice(
    $.covergroup_option,
    $.covergroup_coverpoint_binspec
  ),

  covergroup_coverpoint_binspec: $ => seq(
    $.bins_keyword,
    $.id, // identifier
    optseq(
      '[',
      optional(
        $.expression // constant_expression
      ),
      ']'
    ),
    '=', $.coverpoint_bins
  ),

  coverpoint_bins: $ => choice(
    seq(
      '[', $.covergroup_range_list, ']',
      optseq(
        'with', '(',
        $.expression, // covergroup_expression
        ')'
      ),
      ';'
    ),
    seq(
      $.id, // coverpoint_identifier,
      'with', '(',
      $.expression, // covergroup_expression
      ')',
      ';'
    ),
    seq('default', ';')
  ),

  covergroup_range_list: $ => seq(
    $.covergroup_value_range, repseq(',', $.covergroup_value_range)
  ),

  covergroup_value_range: $ => choice(
    $.expression,
    seq($.expression, '..', optional($.expression)),
    seq(optional($.expression), '..', $.expression)
  ),

  bins_keyword: $ => choice('bins', 'illegal_bins', 'ignore_bins'),

  // covergroup_expression: $ => expression

  covergroup_cross: $ => seq(
    $.id, // covercross_identifier
    ':', 'cross',
    $.id, // coverpoint_identifier
    repseq(
      ',', $.id // coverpoint_identifier
    ),
    optseq('iff', '(', $.expression, ')'),
    $.cross_item_or_null
  ),

  cross_item_or_null: $ => choice(
    seq(
      '{',
      // repeat($.covergroup_cross_body_item),
      '}'
    ),
    ';'
  ),

  // B.17 Conditional compilation

  package_body_compile_if:         $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.package_body_compile_if_item,    optseq('else', $.package_body_compile_if_item)),
  monitor_body_compile_if:         $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.monitor_body_compile_if_item,    optseq('else', $.monitor_body_compile_if_item)),
  action_body_compile_if:          $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.action_body_compile_if_item,     optseq('else', $.action_body_compile_if_item)),
  component_body_compile_if:       $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.component_body_compile_if_item,  optseq('else', $.component_body_compile_if_item)),
  struct_body_compile_if:          $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.struct_body_compile_if_item,     optseq('else', $.struct_body_compile_if_item)),

  // Unresolved conflict for symbol sequence:
  // 'function'  function_prototype  '{'  'if'  '('  expression  ')'  'compile'  'if'  '('  expression  ')'  procedural_compile_if_stmt  •  'else'  …

  // Possible interpretations:

  // 1:  'function'  function_prototype  '{'  'if'  '('  expression  ')'  (procedural_compile_if  'compile'  'if'  '('  expression  ')'  procedural_compile_if_stmt  •  'else'  procedural_compile_if_stmt)
  // 2:  'function'  function_prototype  '{'  'if'  '('  expression  ')'  (procedural_compile_if  'compile'  'if'  '('  expression  ')'  procedural_compile_if_stmt)  •  'else'  …

  // Possible resolutions:
  // 1:  Specify a left or right associativity in `procedural_compile_if`
  // 2:  Add a conflict for these rules: `procedural_compile_if`
  procedural_compile_if:           $ => prec.left(2,
    seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.procedural_compile_if_stmt,      optseq('else', $.procedural_compile_if_stmt))
  ),
  // Unresolved conflict for symbol sequence:
  // struct_kind  id  '{'  'constraint'  'if'  '('  expression  ')'  'compile'  'if'  '('  expression  ')'  constraint_body_compile_if_item  •  'else'  …

  // Possible interpretations:
  // 1:  struct_kind  id  '{'  'constraint'  'if'  '('  expression  ')'  (constraint_body_compile_if  'compile'  'if'  '('  expression  ')'  constraint_body_compile_if_item  •  'else'  constraint_body_compile_if_item)
  // 2:  struct_kind  id  '{'  'constraint'  'if'  '('  expression  ')'  (constraint_body_compile_if  'compile'  'if'  '('  expression  ')'  constraint_body_compile_if_item)  •  'else'  …

  // Possible resolutions:
  // 1:  Specify a left or right associativity in `constraint_body_compile_if`
  // 2:  Add a conflict for these rules: `constraint_body_compile_if`
  constraint_body_compile_if:      $ => prec.left(2, seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.constraint_body_compile_if_item, optseq('else', $.constraint_body_compile_if_item))),
  covergroup_body_compile_if:      $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.covergroup_body_compile_if_item, optseq('else', $.covergroup_body_compile_if_item)),
  override_compile_if:             $ => seq('compile', 'if', '(', $.expression, /* constant_expression */ ')', $.override_compile_if_stmt,        optseq('else', $.override_compile_if_stmt)),
  package_body_compile_if_item:    $ => seq('{', repeat($.package_body_item),    '}'),
  action_body_compile_if_item:     $ => seq('{', repeat($.action_body_item),     '}'),
  monitor_body_compile_if_item:    $ => seq('{', repeat($.monitor_body_item),    '}'),
  component_body_compile_if_item:  $ => seq('{', repeat($.component_body_item),  '}'),
  struct_body_compile_if_item:     $ => seq('{', repeat($.struct_body_item),     '}'),
  procedural_compile_if_stmt:      $ => seq('{', repeat($.procedural_stmt),      '}'),
  constraint_body_compile_if_item: $ => seq('{', repeat($.constraint_body_item), '}'),
  covergroup_body_compile_if_item: $ => seq('{', repeat($.covergroup_body_item), '}'),
  override_compile_if_stmt:        $ => seq('{', repeat($.override_stmt),        '}'),
  compile_has_expr:                $ => seq('compile', 'has',     '(', $.static_ref_path,     ')'),
  compile_assert_stmt:             $ => seq('compile', 'assert',  '(', $.expression, /* $.constant_expression */ optseq(',', $.string_literal), ')', ';'),

  // B.18 Expressions

  // constant_expression: $ => $.expression,

  expression: $ => choice(
    $.primary,
    seq(choice($.unary_operator, $.logic_operator), $.primary),
    prec.left(seq($.expression, $.binary_operator, $.expression)),
    $.conditional_expression,
    $.in_expression,
  ),

  unary_operator: $ => choice('-', '~', '&', '|', '^' ),

  // add for if
  logic_operator: $ => '!',

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

  in_expression: $ => prec.left(1, choice(
    seq($.expression, 'in', '[', $.open_range_list, ']'),
    seq(
      $.expression,
      'in',
      $.expression // collection_expression
    )
  )),

  open_range_list: $ => seq(
    $.open_range_value, repseq(',', $.open_range_value)
  ),

  open_range_value: $ => prec.left(1, seq(
    $.expression, optseq('..', $.expression)
  )),

  // collection_expression: $ => $.expression,

  primary: $ => choice(
    $.number,
    $.ref_path,
    $.aggregate_literal,
    $.bool_literal,
    $.string_literal,
    $.null_ref,
    $.paren_expr,
    $.cast_expression,
    $.compile_has_expr
  ),

  paren_expr: $ => seq('(', $.expression, ')'),

  cast_expression: $ => seq(
    '(',
    $.casting_type,
    ')',
    $.expression
  ),

  // Unresolved conflict for symbol sequence:
  // 'function'  function_prototype  '{'  'foreach'  '('  static_ref_path  •  '['  …

  // Possible interpretations:
  // 1:  'function'  function_prototype  '{'  'foreach'  '('  (ref_path  static_ref_path  •  bit_slice)
  // 2:  'function'  function_prototype  '{'  'foreach'  '('  (ref_path  static_ref_path)  •  '['  …

  // Possible resolutions:
  // 1:  Specify a left or right associativity in `ref_path`
  // 2:  Add a conflict for these rules: `ref_path`
  ref_path: $ => prec.left(1,
    choice(
      seq($.static_ref_path, optseq('.', $.hierarchical_id), optional($.bit_slice)),
      seq(optseq('super', '.'), $.hierarchical_id, optional($.bit_slice))
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
    '(', optseq( $.expression, repseq(',', $.expression)), ')'
  ),

  // B.19 Identifiers

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

  type_identifier: $ => prec.left(1, seq(
    optional('::'),
    repseq($.type_identifier_elem, '::'),
    $.type_identifier_elem
  )),

  type_identifier_elem: $ => seq(
    $.id, // identifier
    optional($.template_param_value_list)
  ),

  // B.20 Numbers and literals

  number: $ => prec.left(1, choice(
    $.integer_number,
    $.floating_point_number
  )),

  integer_number: $ => token(choice(
    /0[bB][01][01_]*/,  // bin_number
    /0[0-7_]*/,         // oct_number
    /[1-9][0-9_]*/,      // dec_number
    /0[xX][0-9a-fA-F][0-9a-fA-F_]*/, // hex_number
    /[0-9]*'[sS]?[bB][01_]+/, // based_bin_number
    /[0-9]*'[sS]?[oO][0-7_]+/, // based_oct_number
    /[0-9]*'[sS]?[dD][0-9_]+/, // based_dec_number
    /[0-9]*'[sS]?[hH][0-9a-fA-F_]*/  // based_hex_number
  )),

  floating_point_number: $ => token(choice(
    /[0-9][0-9_]*[.][0-9][0-9_]*/, // floating_point_dec_number
    /[0-9][0-9_]*([.][0-9][0-9_]*)?[eE][+-]?[0-9][0-9_]*/ // floating_point_sci_number
  )),

  aggregate_literal: $ => choice(
    // $.empty_aggregate_literal,
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

  // B.21 Additional lexical conventions

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
    $.TRIPLE_QUOTED_STRING
  ),

  QUOTED_STRING: $ => seq(
    '"',
    optional($.QUOTED_STRING_ITEM),
    '"'
  ),

  QUOTED_STRING_ITEM: $ => seq(
    repeat1(choice(
      token.immediate(/[^\\"]+/),
      token.immediate(seq('\\', /./))
    ))
  ),

  TRIPLE_QUOTED_STRING: $ => seq(
    '"""',
    optional($.TRIPLE_QUOTED_STRING_ITEM),
    '"""'
  ),

  TRIPLE_QUOTED_STRING_ITEM: $ => seq(
    repeat1(choice(
      token.immediate(prec(1, /[^"]+/)),
      token(prec(1, seq('"', /[^"]/))),
      token(prec(1, seq('""', /[^"]/))),
    ))
  ),

  SNPS_SHADOWED: $ => seq(
    '_snps_shadowed',
    '{',
    token.immediate(prec(1, /[^}]+/)),
    '}'
  ),

};

module.exports = grammar({
  name: 'pss',
  word: $ => $.id,
  rules: rules,
  extras: $ => [
    /\s|\\\r?\n/,
    $.comment,
    // $.template
  ],

  // resolve using conflicts insteand of prec, prec might cause issues
  conflicts: $ => [
    // Unresolved conflict for symbol sequence:
    // 'function'  function_prototype  '{'  member_path_elem  •  '.'  …

    // Possible interpretations:
    // 1:  'function'  function_prototype  '{'  (function_ref_path_repeat1  member_path_elem  •  '.')            (precedence: 0, associativity: Left)
    // 2:  'function'  function_prototype  '{'  (hierarchical_id  member_path_elem  •  hierarchical_id_repeat1)
    // 3:  'function'  function_prototype  '{'  (static_ref_path  member_path_elem)  •  '.'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `hierarchical_id` and `function_ref_path_repeat1` than in the other rules.
    // 2:  Specify a higher precedence in `static_ref_path` than in the other rules.
    // 3:  Specify a left or right associativity in `static_ref_path`
    // 4:  Add a conflict for these rules: `static_ref_path`, `function_ref_path`, `hierarchical_id`
    [$.hierarchical_id, $.static_ref_path],

    // Unresolved conflict for symbol sequence:
    // 'function'  function_prototype  '{'  member_path_elem  •  '.'  …
    // Possible interpretations:
    // 1:  'function'  function_prototype  '{'  (function_ref_path_repeat1  member_path_elem  •  '.')            (precedence: 0, associativity: Left)
    // 2:  'function'  function_prototype  '{'  (hierarchical_id  member_path_elem  •  hierarchical_id_repeat1)
    // 3:  'function'  function_prototype  '{'  (static_ref_path  member_path_elem)  •  '.'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `hierarchical_id` and `function_ref_path_repeat1` than in the other rules.
    // 2:  Specify a higher precedence in `static_ref_path` than in the other rules.
    // 3:  Specify a left or right associativity in `static_ref_path`
    // 4:  Add a conflict for these rules: `static_ref_path`, `function_ref_path`, `hierarchical_id`
    [$.hierarchical_id, $.static_ref_path, $.function_ref_path],

    // Unresolved conflict for symbol sequence:
    // struct_kind  id  '{'  ';'  •  '}'  …

    // Possible interpretations:
    // 1:  struct_kind  id  '{'  (exec_block_stmt  ';')  •  '}'  …
    // 2:  struct_kind  id  '{'  (struct_body_item  ';')  •  '}'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `struct_body_item` than in the other rules.
    // 2:  Specify a higher precedence in `exec_block_stmt` than in the other rules.
    // 3:  Add a conflict for these rules: `struct_body_item`, `exec_block_stmt`
    [$.struct_body_item, $.exec_block_stmt],

    // Unresolved conflict for symbol sequence:
    // 'extend'  'action'  type_identifier  '{'  ';'  •  '}'  …

    // Possible interpretations:
    // 1:  'extend'  'action'  type_identifier  '{'  (action_body_item  ';')  •  '}'  …
    // 2:  'extend'  'action'  type_identifier  '{'  (exec_block_stmt  ';')  •  '}'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `action_body_item` than in the other rules.
    // 2:  Specify a higher precedence in `exec_block_stmt` than in the other rules.
    // 3:  Add a conflict for these rules: `action_body_item`, `exec_block_stmt`
    [$.action_body_item, $.exec_block_stmt],

    // 'component'  id  '{'  ';'  •  '}'  …
    // Unresolved conflict for symbol sequence:
    //
    // Possible interpretations:
    // 1:  'component'  id  '{'  (component_body_item  ';')  •  '}'  …
    // 2:  'component'  id  '{'  (exec_block_stmt  ';')  •  '}'  …
    //
    // Possible resolutions:
    // 1:  Specify a higher precedence in `exec_block_stmt` than in the other rules.
    // 2:  Specify a higher precedence in `component_body_item` than in the other rules.
    // 3:  Add a conflict for these rules: `exec_block_stmt`, `component_body_item`
    [$.component_body_item, $.exec_block_stmt],

    // Unresolved conflict for symbol sequence:
    // 'extend'  'action'  type_identifier  '{'  ';'  •  '}'  …

    // Possible interpretations:
    // 1:  'extend'  'action'  type_identifier  '{'  (action_body_item  ';')  •  '}'  …
    // 2:  'extend'  'action'  type_identifier  '{'  (exec_block_stmt  ';')  •  '}'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `action_body_item` than in the other rules.
    // 2:  Specify a higher precedence in `exec_block_stmt` than in the other rules.
    // 3:  Add a conflict for these rules: `action_body_item`, `exec_block_stmt`
    [$.covergroup_type_instantiation, $.type_identifier_elem],

    // Unresolved conflict for symbol sequence:
    // 'function'  function_prototype  '{'  '::'  member_path_elem  •  '.'  …

    // Possible interpretations:
    // 1:  'function'  function_prototype  '{'  '::'  (function_ref_path_repeat1  member_path_elem  •  '.')  (precedence: 0, associativity: Left)
    // 2:  'function'  function_prototype  '{'  (static_ref_path  '::'  member_path_elem)  •  '.'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `function_ref_path_repeat1` than in the other rules.
    // 2:  Specify a higher precedence in `static_ref_path` than in the other rules.
    // 3:  Specify a left or right associativity in `static_ref_path`
    // 4:  Add a conflict for these rules: `static_ref_path`, `function_ref_path`
    [$.static_ref_path, $.function_ref_path],

    // Unresolved conflict for symbol sequence:
    // 'compile'  'if'  '('  '('  type_identifier  •  ')'  …

    // Possible interpretations:
    // 1:  'compile'  'if'  '('  '('  (casting_type  type_identifier)  •  ')'  …
    // 2:  'compile'  'if'  '('  '('  (enum_type  type_identifier)  •  ')'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `casting_type` than in the other rules.
    // 2:  Specify a higher precedence in `enum_type` than in the other rules.
    // 3:  Add a conflict for these rules: `casting_type`, `enum_type`
    [$.casting_type, $.enum_type],

    // Unresolved conflict for symbol sequence:
    // 'compile'  'if'  '('  '('  type_identifier  •  ')'  …

    // Possible interpretations:
    // 1:  'compile'  'if'  '('  '('  (casting_type  type_identifier)  •  ')'  …
    // 2:  'compile'  'if'  '('  '('  (enum_type  type_identifier)  •  ')'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `casting_type` than in the other rules.
    // 2:  Specify a higher precedence in `enum_type` than in the other rules.
    // 3:  Add a conflict for these rules: `casting_type`, `enum_type`
    [$.component_path_elem, $.type_identifier_elem],

    // Unresolved conflict for symbol sequence:
    // 'abstract'  'monitor'  id  '{'  type_identifier  id  •  ';'  …

    // Possible interpretations:
    // 1:  'abstract'  'monitor'  id  '{'  type_identifier  (action_instantiation  id)  •  ';'  …
    // 2:  'abstract'  'monitor'  id  '{'  type_identifier  (monitor_instantiation  id)  •  ';'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `action_instantiation` than in the other rules.
    // 2:  Specify a higher precedence in `monitor_instantiation` than in the other rules.
    // 3:  Add a conflict for these rules: `action_instantiation`, `monitor_instantiation`
    [$.action_instantiation, $.monitor_instantiation],

    // Unresolved conflict for symbol sequence:
    // 'compile'  'if'  '('  '('  casting_type  ')'  expression  •  '*'  …

    // Possible interpretations:
    // 1:  'compile'  'if'  '('  '('  casting_type  ')'  (expression  expression  •  binary_operator  expression)  (precedence: 0, associativity: Left)
    // 2:  'compile'  'if'  '('  (cast_expression  '('  casting_type  ')'  expression)  •  '*'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `expression` than in the other rules.
    // 2:  Specify a higher precedence in `cast_expression` than in the other rules.
    // 3:  Specify a left or right associativity in `cast_expression`
    // 4:  Add a conflict for these rules: `expression`, `cast_expression`
    [$.expression, $.cast_expression],

    // Unresolved conflict for symbol sequence:
    // 'compile'  'if'  '('  '('  casting_type  ')'  expression  •  '?'  …

    // Possible interpretations:
    // 1:  'compile'  'if'  '('  '('  casting_type  ')'  (conditional_expression  expression  •  '?'  expression  ':'  expression)  (precedence: 0, associativity: Left)
    // 2:  'compile'  'if'  '('  (cast_expression  '('  casting_type  ')'  expression)  •  '?'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `conditional_expression` than in the other rules.
    // 2:  Specify a higher precedence in `cast_expression` than in the other rules.
    // 3:  Specify a left or right associativity in `cast_expression`
    // 4:  Add a conflict for these rules: `conditional_expression`, `cast_expression`
    [$.conditional_expression, $.cast_expression],

    // Unresolved conflict for symbol sequence:
    // 'abstract'  'monitor'  id  '{'  'activity'  '{'  id  inline_constraints_or_empty  •  '{'  …

    // Possible interpretations:
    // 1:  'abstract'  'monitor'  id  '{'  'activity'  '{'  (activity_action_traversal_stmt  id  inline_constraints_or_empty)  •  '{'  …
    // 2:  'abstract'  'monitor'  id  '{'  'activity'  '{'  (monitor_activity_monitor_traversal_stmt  id  inline_constraints_or_empty)  •  '{'  …

    // Possible resolutions:
    // 1:  Specify a higher precedence in `activity_action_traversal_stmt` than in the other rules.
    // 2:  Specify a higher precedence in `monitor_activity_monitor_traversal_stmt` than in the other rules.
    // 3:  Add a conflict for these rules: `activity_action_traversal_stmt`, `monitor_activity_monitor_traversal_stmt`
    [$.activity_action_traversal_stmt, $.monitor_activity_monitor_traversal_stmt],

    // 'function'  function_prototype  '{'  'if'  '('  expression  ')'  'if'  '('  expression  ')'  procedural_stmt  •  'else'  …
    // Unresolved conflict for symbol sequence:
    //
    // Possible interpretations:
    // 1:  'function'  function_prototype  '{'  'if'  '('  expression  ')'  (procedural_if_else_stmt  'if'  '('  expression  ')'  procedural_stmt  •  'else'  procedural_stmt)
    // 2:  'function'  function_prototype  '{'  'if'  '('  expression  ')'  (procedural_if_else_stmt  'if'  '('  expression  ')'  procedural_stmt)  •  'else'  …
    //
    // Possible resolutions:
    // 1:  Specify a left or right associativity in `procedural_if_else_stmt`
    // 2:  Add a conflict for these rules: `procedural_if_else_stmt`
    [$.procedural_if_else_stmt],

    // Unresolved conflict for symbol sequence:
    // 'const'  'array'  '<'  data_type  ','  expression  '>'  •  id  …
    //
    // Possible interpretations:
    // 1:  'const'  'array'  '<'  data_type  ','  expression  (binary_operator  '>')  •  id  …
    // 2:  'const'  (collection_type  'array'  '<'  data_type  ','  expression  '>')  •  id  …
    //
    // Possible resolutions:
    // 1:  Specify a higher precedence in `binary_operator` than in the other rules.
    // 2:  Specify a higher precedence in `collection_type` than in the other rules.
    // 3:  Add a conflict for these rules: `collection_type`, `binary_operator`
    [$.collection_type, $.binary_operator],

    // Unresolved conflict for symbol sequence:
    // 'const'  type_identifier  •  id  …
    //
    // Possible interpretations:
    // 1:  'const'  (data_type  type_identifier)  •  id  …
    // 2:  'const'  (enum_type  type_identifier)  •  id  …
    //
    // Possible resolutions:
    // 1:  Specify a higher precedence in `data_type` than in the other rules.
    // 2:  Specify a higher precedence in `enum_type` than in the other rules.
    // 3:  Add a conflict for these rules: `data_type`, `enum_type`
    [$.data_type, $.enum_type],

    // Unresolved conflict for symbol sequence:
    // package_declaration  •  'package'  …
    //
    // Possible interpretations:
    // 1:  (package_body_item  package_declaration)  •  'package'  …
    // 2:  (portable_stimulus_description  package_declaration)  •  'package'  …
    //
    // Possible resolutions:
    // 1:  Specify a higher precedence in `portable_stimulus_description` than in the other rules.
    // 2:  Specify a higher precedence in `package_body_item` than in the other rules.
    // 3:  Add a conflict for these rules: `portable_stimulus_description`, `package_body_item`
    [$.portable_stimulus_description, $.package_body_item],

    // Unresolved conflict for symbol sequence:
    // 'import'  id  '<'  id  •  ','  …
    //
    // Possible interpretations:
    // 1:  'import'  id  '<'  (member_path_elem  id)  •  ','  …
    // 2:  'import'  id  '<'  (type_identifier_elem  id)  •  ','  …
    //
    // Possible resolutions:
    // 1:  Specify a higher precedence in `member_path_elem` than in the other rules.
    // 2:  Specify a higher precedence in `type_identifier_elem` than in the other rules.
    // 3:  Add a conflict for these rules: `member_path_elem`, `type_identifier_elem`
    [$.member_path_elem, $.type_identifier_elem],

    // Unresolved conflict for symbol sequence:
    // 'import'  id  '<'  id  •  '['  …
    //
    // Possible interpretations:
    // 1:  'import'  id  '<'  (member_path_elem  id  •  member_path_elem_repeat1)
    // 2:  'import'  id  '<'  (member_path_elem  id)  •  '['  …
    //
    // Possible resolutions:
    // 1:  Specify a left or right associativity in `member_path_elem`
    // 2:  Add a conflict for these rules: `member_path_elem`
    [$.member_path_elem],
  ],
});

/* eslint camelcase: 0 */
/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
