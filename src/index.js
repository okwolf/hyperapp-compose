function merge(target, source) {
  var result = {}
  for (var i in target) {
    result[i] = target[i]
  }
  for (var i in source) {
    result[i] = source[i]
  }
  return result
}

function mergeProps(prevProps, nextProps) {
  return {
    state: merge(prevProps.state, nextProps.state),
    actions: merge(prevProps.actions, nextProps.actions),
    view: prevProps.view || nextProps.view
  }
}

function compose(hoas) {
  return Array.isArray(hoas)
    ? hoas.reduceRight(
        function(prev, next) {
          return function(prevProps) {
            return prev(mergeProps(prevProps, next(prevProps)))
          }
        },
        function(props) {
          return props
        }
      )
    : function(props) {
        return mergeProps(hoas(props), props)
      }
}

export default function(hoas) {
  return function(app) {
    return function(props) {
      return app(compose(hoas)(props))
    }
  }
}
