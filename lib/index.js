'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      Identifier: function Identifier(path, state) {
        var replacements = state.opts;
        var keys = Object.keys(replacements);

        for (var i = 0, len = keys.length; i < len; ++i) {
          var key = keys[i];

          if (path.node.name === key) {
            var replacement = replacements[key];
            // const scope = Object.keys(path.scope.parent.references)
            //   .filter(key => path.scope.parent.references[key])
            //   .concat(Object.keys(path.scope.parent.globals)
            //     .filter(key => path.scope.parent.globals[key])
            //   )
            //   .includes(replacement)
            //
            // path.replaceWith(scope ?
            //   t.identifier(replacement) :
            //   t.valueToNode(replacement)
            // )

            path.replaceWith(replacement === '' ? t.valueToNode(replacement) : t.identifier(replacement));

            // path.replaceWith(t.valueToNode(
            //   replacement === 'true' ? true :
            //     replacement === 'false' ? false :
            //       replacement
            // ))

            if (path.parentPath.isBinaryExpression()) {
              var result = path.parentPath.evaluate();

              if (result.confident) path.parentPath.replaceWith(t.valueToNode(result.value));
            }

            break;
          }
        }
      },


      // process.env.NODE_ENV
      MemberExpression: function MemberExpression(path, state) {
        var replacements = state.opts;
        var keys = Object.keys(replacements);

        for (var i = 0, len = keys.length; i < len; ++i) {
          var key = keys[i];

          if (path.matchesPattern(key)) {
            path.replaceWith(t.valueToNode(replacements[key]));

            if (path.parentPath.isBinaryExpression()) {
              var result = path.parentPath.evaluate();

              if (result.confident) path.parentPath.replaceWith(t.valueToNode(result.value));
            }

            break;
          }
        }
      },


      // typeof window
      UnaryExpression: function UnaryExpression(path, state) {
        if (path.node.operator !== 'typeof') return;

        var replacements = state.opts;
        var keys = Object.keys(replacements);
        var typeofValues = {};

        keys.forEach(function (key) {
          if (key.substring(0, 7) === 'typeof ') typeofValues[key.substring(7)] = replacements[key];
        });

        var argumentNames = Object.keys(typeofValues);

        for (var i = 0, len = argumentNames.length; i < len; ++i) {
          var argumentName = argumentNames[i];

          if (path.node.argument.name === argumentName) {
            path.replaceWith(t.valueToNode(typeofValues[argumentName]));

            if (path.parentPath.isBinaryExpression()) {
              var result = path.parentPath.evaluate();

              if (result.confident) path.parentPath.replaceWith(t.valueToNode(result.value));
            }

            break;
          }
        }
      }
    }
  };
};