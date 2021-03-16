# vue-simple-state

Quickly create shared complex reactive state structures

<hr />

## Install

```shell
npm install --save vue-simple-state
```

## Usage - `useState`

`useState` is meant to be used directly inside a `setup` function in `Vue` 3+. Read more about `setup` [in Vue's docs](https://v3.vuejs.org/guide/composition-api-setup.html).

### `state` - Direct read-only access to state
The `state` property is read-only direct access to the current state. `state` is used as a readonly ref using `Vue`'s built-in methods
```javascript
import { useState } from 'vue-simple-state'

export default {
    // ...
    setup() {
        const { state } = useState()

        return {
            state
        }
    }
}
```
Read more about `readonly` [in Vue's docs](https://v3.vuejs.org/api/basic-reactivity.html#readonly).
Read more about `ref` [in Vue's docs](https://v3.vuejs.org/api/refs-api.html#ref).

### `computed(fn)` - Create a read-only computed state variable using a function
Variables created using the `computed` method take a function to pull out a value from state. `computed` returns a read-only computed variable using `Vue`'s built-in method
* `fn <(state) => any>` - Function used to extract value from state
```javascript
import { useState } from 'vue-simple-state'

export default {
    // ...
    setup() {
        const { computed } = useState()

        const userName = computed((state) => {
            return state.user.name
        })

        return {
            userName
        }
    }
}
```
Read more about `computed` [in Vue's docs](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#computed-values).

### `reactive(path, default?)` - Create a read-only state variable by path
Variables created using the `reactive` method take a path to pull out a value from state and an optional default value if none is found. `reactive` returns a read-only computed variable using `Vue`'s built-in method
* `path <string[]>` - Path by property name to access state value
* `default <any?>` - (Optional) Default value to return when state value is not set
```javascript
import { useState } from 'vue-simple-state'

export default {
    // ...
    setup() {
        const { reactive } = useState()

        const userName = reactive(['user', 'name'], 'Joe')

        return {
            userName
        }
    }
}
```
Read more about `computed` [in Vue's docs](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#computed-values).

### `writable(path, default?)` - Create a read-write computed state variable by path
Variables created using the `writable` method take a path to pull out a value from state and an optional default value if none is found. `writable` returns a writable computed variable using `Vue`'s built-in method
* `path <string[]>` - Path by property name to access state value
* `default <any?>` - (Optional) Default value to return when state value is not set
```vue
<template>
    <input v-model="userName" />
</template>

<script>
import { useState } from 'vue-simple-state'

export default {
    // ...
    setup() {
        const { writable } = useState()

        const userName = writable(['user', 'name'], 'Joe')

        return {
            userName
        }
    }
}
</script>
```
Read more about `computed` [in Vue's docs](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#computed-values).

### `useNamespace(path)` - Create a namespace for state
When using state in components, splitting out state to group related information is essential. Namespaces share all of the same properties/methods as described above but they are scoped to the defined namespace. Namespaces return their own `useNamespace` method, allowing creation of a namespace off of another namespace
* `path <string[]>` - Path by property name to access state value
```javascript
import { useState } from 'vue-simple-state'

export default {
    // ...
    setup() {
        const { useNamespace } = useState()
        const { reactive } = useNamespace(['user'])

        const userName = reactive(['name'], 'Joe')

        return {
            userName
        }
    }
}
```

## Advanced usage - `State`

`State` is the service maintaining the `BehaviorSubject` that is being used to handle the application state

### `State.observable` - Direct read-only access to the observable
```javascript
import { State } from 'vue-simple-state'

const behaviorSubject = State.observable

behaviorSubject
    .pipe(...)
    .subscribe(fn)
```
Read more about `BehaviorSubject` [in rxjs's docs](https://rxjs-dev.firebaseapp.com/api/index/class/BehaviorSubject)

### `State.update(fn)` - Update state using a function
* `fn <(state) => state>` - Function used to manipulate state and return an updated state
```javascript
import { State } from 'vue-simple-state'

State.update((state) => {
    state.property = 'value'
    return state
})
```

### `State.subscribe(fn)` - Subscribe a function to state changes
Returns a function that when called will unsubscribe the observer
* `fn <(state) => void>` - Function called each time state changes
```javascript
import { State } from 'vue-simple-state'

function onStateChange(state) {
    console.log('called on state updates', state)
}

const unsubscribe = State.subscribe(onStateChange)

// cleanup subscription
unsubscribe()
```

## Advanced Examples

### Reading/Writing state to localStorage
```javascript
import { State } from 'vue-simple-state'

function getSavedState() {
    return window.localStorage.getItem(...)
}

function setSavedState(state) {
    window.localStorage.setItem(...)
}

State.update(getSavedState)
State.subscribe(setSavedState)
```

### Creating a custom writable computed state variable
```javascript
import { computed } from 'vue'
import { State, useState } from 'vue-simple-state'

export default {
    // ...
    setup() {
        const { state } = useState()

        // Given: state.tags === 'one,two'
        // Read tags as an Array: ['one', 'two']
        // Update tags in state as a String: 'one,two,X'
        const tags = computed({
            get: () => state.value.tags.split(','),
            set: (val) => {
                State.update((s) => {
                    s.tags = val.join(',')
                    return s
                })
            }
        })

        return {
            tags
        }
    }
}
```