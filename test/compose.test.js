import { app, h } from "hyperapp"
import compose from "../src"

window.requestAnimationFrame = process.nextTick

test("add state", done =>
  app(
    compose(() => ({
      state: { counter: 0 }
    }))
  )({
    actions: {
      get: state => {
        expect(state).toEqual({ counter: 0 })
        done()
      }
    }
  }).get())

test("add an action", done =>
  app(
    compose(() => ({
      actions: { stop: done }
    }))
  )({
    actions: {
      start(state, actions) {
        actions.stop()
      }
    }
  }).start())

test("compose multiple states", done =>
  app(
    compose([
      props => {
        expect(props).toEqual({ actions: { get: expect.any(Function) } })
        return {
          state: {
            foo: {
              bar: {
                baz: true
              }
            }
          }
        }
      },
      props => {
        expect(props).toEqual({
          state: {
            foo: {
              bar: {
                baz: true
              }
            }
          },
          actions: { get: expect.any(Function) }
        })
        return {
          state: {
            fizz: {
              buzz: {
                fizzbuzz: "fizzbuzz"
              }
            }
          }
        }
      }
    ])
  )({
    actions: {
      get: state => {
        expect(state).toEqual({
          foo: {
            bar: {
              baz: true
            }
          },
          fizz: {
            buzz: {
              fizzbuzz: "fizzbuzz"
            }
          }
        })
        done()
      }
    }
  }).get())

test("compose multiple actions", done =>
  app(
    compose([
      props => {
        expect(props).toEqual({})
        return {
          actions: {
            foo(state, actions) {
              actions.bar()
            }
          }
        }
      },
      props => {
        expect(props).toEqual({
          state: {},
          actions: {
            foo: expect.any(Function)
          }
        })
        return {
          actions: { bar: done }
        }
      }
    ])
  )({}).foo())

test("update view", done =>
  app(
    compose(props => {
      expect(props).toEqual({
        state: {
          counter: 1
        },
        view: expect.any(Function)
      })

      return {
        view: state =>
          h(
            "div",
            {},
            h("header", {}, "My awesome header"),
            props.view(state),
            h("footer", {}, "My awesome footer")
          )
      }
    })
  )({
    state: {
      counter: 1
    },
    view: state =>
      h(
        "h1",
        {
          oncreate() {
            expect(document.body.innerHTML).toBe(
              "<div><header>My awesome header</header><h1>1</h1><footer>My awesome footer</footer></div>"
            )
            done()
          }
        },
        state.counter
      )
  }))

test("override view", done =>
  app(
    compose(props => {
      expect(props).toEqual({
        state: {
          counter: 1
        },
        view: expect.any(Function)
      })
      return {
        view: state =>
          h(
            "main",
            {
              oncreate() {
                expect(document.body.innerHTML).toBe("<main>1</main>")
                done()
              }
            },
            state.counter
          )
      }
    })
  )({
    state: {
      counter: 1
    },
    view: state => h("h1", {}, state.counter)
  }))
